from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import json
from fastapi import HTTPException
from sqlalchemy import func

from app.models import Employee, Department, Attendance, LocationTracking, SiteAttendance, Shift, ShiftType, Task
from app.schemas.attendance import AttendanceCreate, AttendanceCheckOut, LocationTrackingCreate

class AttendanceService:
    @staticmethod
    def check_in(db: Session, attendance_in: AttendanceCreate, current_user_id: int):
        active = db.query(Attendance).filter(Attendance.employee_id == current_user_id, Attendance.check_out == None).first()
        if active: raise HTTPException(status_code=400, detail="Already checked in")

        attendance_data = attendance_in.model_dump()
        attendance_data["employee_id"] = current_user_id
        attendance_data["check_in"] = datetime.datetime.utcnow()
        
        db_attendance = Attendance(**attendance_data)
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        
        # Auto-assign shift
        today = attendance_data["check_in"].date()
        existing_shift = db.query(Shift).filter(Shift.employee_id == current_user_id, Shift.shift_date == today).first()
        if not existing_shift:
            auto_shifts = db.query(ShiftType).filter(ShiftType.is_auto_shift == True).all()
            if auto_shifts:
                current_time = attendance_data["check_in"].time()
                best_shift = None
                min_diff = None
                for st in auto_shifts:
                    st_minutes = st.start_time.hour * 60 + st.start_time.minute
                    ct_minutes = current_time.hour * 60 + current_time.minute
                    diff = abs(st_minutes - ct_minutes)
                    if diff > 12 * 60: diff = 24 * 60 - diff
                    if min_diff is None or diff < min_diff:
                        min_diff = diff
                        best_shift = st
                if best_shift:
                    db.add(Shift(employee_id=current_user_id, shift_type_id=best_shift.id, shift_date=today, status="Scheduled"))
                    db.commit()
        return db_attendance

    @staticmethod
    def check_out(db: Session, check_out_data: AttendanceCheckOut, current_user_id: int):
        db_attendance = db.query(Attendance).filter(Attendance.employee_id == current_user_id, Attendance.check_out == None).order_by(Attendance.check_in.desc()).first()
        if not db_attendance: raise HTTPException(status_code=404, detail="No active attendance record found")
        
        db_attendance.check_out = datetime.datetime.utcnow()
        db_attendance.check_out_lat = check_out_data.lat
        db_attendance.check_out_long = check_out_data.long
        db.commit()
        db.refresh(db_attendance)
        return db_attendance

    @staticmethod
    def get_live_attendance(db: Session):
        active_records = db.query(Attendance).filter(Attendance.check_out == None).all()
        results = []
        for att in active_records:
            emp = db.query(Employee).filter(Employee.id == att.employee_id).first()
            dept = db.query(Department).filter(Department.id == emp.department_id).first() if emp and emp.department_id else None
            latest_track = db.query(LocationTracking).filter(LocationTracking.attendance_id == att.id).order_by(LocationTracking.timestamp.desc()).first()
            results.append({
                **att.__dict__,
                "employee_name": emp.name if emp else "Unknown",
                "department": dept.name if dept else "General",
                "latest_lat": latest_track.lat if latest_track else att.lat,
                "latest_long": latest_track.long if latest_track else att.long
            })
        return results

    @staticmethod
    def sync_location(db: Session, location_in: LocationTrackingCreate, current_user_id: int):
        active = db.query(Attendance).filter(Attendance.employee_id == current_user_id, Attendance.check_out == None).order_by(Attendance.check_in.desc()).first()
        if not active: raise HTTPException(status_code=404, detail="No active attendance session")
        db_track = LocationTracking(**location_in.model_dump(), attendance_id=active.id)
        db.add(db_track)
        db.commit()
        db.refresh(db_track)
        return db_track

    @staticmethod
    def _append_timeline(db_site_att, step: str, label: str, extra: dict = None):
        timeline = []
        if db_site_att.execution_timeline:
            try: timeline = json.loads(db_site_att.execution_timeline)
            except: timeline = []
        event = {"step": step, "timestamp": datetime.datetime.utcnow().isoformat(), "label": label}
        if extra: event.update(extra)
        timeline.append(event)
        db_site_att.execution_timeline = json.dumps(timeline)

    @staticmethod
    def start_site_session(db: Session, site_id: Optional[int], task_id: Optional[int], current_user_id: int):
        active_att = db.query(Attendance).filter(Attendance.employee_id == current_user_id, Attendance.check_out == None).order_by(Attendance.check_in.desc()).first()
        if not active_att: raise HTTPException(status_code=400, detail="Must be clocked in to the app first.")

        db_site_att = SiteAttendance(attendance_id=active_att.id, site_id=site_id, task_id=task_id, start_time=datetime.datetime.utcnow(), status="En Route")
        AttendanceService._append_timeline(db_site_att, "started", "Journey Started")
        db.add(db_site_att)
        db.commit()
        db.refresh(db_site_att)
        return db_site_att

    @staticmethod
    def site_check_in(db: Session, site_att_id: int):
        db_site_att = db.query(SiteAttendance).filter(SiteAttendance.id == site_att_id).first()
        if not db_site_att: raise HTTPException(status_code=404, detail="Site session not found")
        db_site_att.reached_at = db_site_att.check_in = datetime.datetime.utcnow()
        db_site_att.status = "On Site"
        AttendanceService._append_timeline(db_site_att, "reached", "Reached Site")
        db.commit()
        db.refresh(db_site_att)
        return db_site_att

    @staticmethod
    def site_complete(db: Session, site_att_id: int, notes: str, photos: Optional[str]):
        db_site_att = db.query(SiteAttendance).filter(SiteAttendance.id == site_att_id).first()
        if not db_site_att: raise HTTPException(status_code=404, detail="Site session not found")
        db_site_att.notes = notes
        db_site_att.photos = photos
        db_site_att.status = "Completed"
        
        photo_count = 0
        if photos:
            try:
                parsed = json.loads(photos)
                photo_count = len(parsed) if isinstance(parsed, list) else 1
            except: photo_count = 1
        AttendanceService._append_timeline(db_site_att, "completed", "Work Completed", {"photos_count": photo_count, "remarks_preview": notes[:80]})
        
        if db_site_att.task_id:
            db_task = db.query(Task).filter(Task.id == db_site_att.task_id).first()
            if db_task:
                db_task.status = "done"
                db_task.notes = notes
                db_task.media_url = photos
        db.commit()
        db.refresh(db_site_att)
        return db_site_att

    @staticmethod
    def site_check_out(db: Session, site_att_id: int):
        db_site_att = db.query(SiteAttendance).filter(SiteAttendance.id == site_att_id).first()
        if not db_site_att: raise HTTPException(status_code=404, detail="Site session not found")
        db_site_att.check_out = datetime.datetime.utcnow()
        db_site_att.status = "Finished"
        AttendanceService._append_timeline(db_site_att, "checked_out", "Checked Out & Left Site")
        db.commit()
        db.refresh(db_site_att)
        return db_site_att
