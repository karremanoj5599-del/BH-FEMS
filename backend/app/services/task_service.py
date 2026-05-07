from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException
import json

from app.models import Task, TaskProgress, MaterialUsage, Employee, SiteAttendance, Attendance, LocationTracking
from app.schemas.task import TaskCreate, TaskUpdate, MaterialUsageCreate, TaskProgressCreate

class TaskService:
    @staticmethod
    def create_task(db: Session, task_in: TaskCreate, current_user_id: int):
        db_task = Task(**task_in.model_dump())
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def get_tasks(
        db: Session,
        skip: int = 0, 
        limit: int = 100, 
        site_id: int = None, 
        assigned_to: int = None, 
        status: str = None,
        priority: str = None,
        start_date: str = None,
        end_date: str = None
    ):
        query = db.query(Task)
        if site_id:
            query = query.filter(Task.site_id == site_id)
        if assigned_to:
            query = query.filter(Task.assigned_employee == assigned_to)
        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
                query = query.filter(Task.deadline >= start_dt)
            except ValueError:
                pass
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date)
                query = query.filter(Task.deadline <= end_dt)
            except ValueError:
                pass
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_task(db: Session, task_id: int):
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")
        return db_task

    @staticmethod
    def update_task(db: Session, task_id: int, task_in: TaskUpdate):
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        update_data = task_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
        
        db.commit()
        db.refresh(db_task)
        return db_task

    @staticmethod
    def delete_task(db: Session, task_id: int):
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        db.query(TaskProgress).filter(TaskProgress.task_id == task_id).delete(synchronize_session=False)
        db.query(MaterialUsage).filter(MaterialUsage.task_id == task_id).delete(synchronize_session=False)
        db.query(SiteAttendance).filter(SiteAttendance.task_id == task_id).update({"task_id": None}, synchronize_session=False)
        
        db.delete(db_task)
        db.commit()
        return {"message": "Task deleted successfully"}

    @staticmethod
    def log_material_usage(db: Session, task_id: int, material_in: MaterialUsageCreate, current_user_id: int):
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")
        db_material = MaterialUsage(**material_in.model_dump(), employee_id=current_user_id)
        db.add(db_material)
        db.commit()
        db.refresh(db_material)
        return db_material

    @staticmethod
    def create_progress(db: Session, task_id: int, progress_in: TaskProgressCreate, current_user_id: int):
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        db_progress = TaskProgress(
            **progress_in.model_dump(), 
            updated_by=current_user_id,
            updated_date=datetime.utcnow()
        )
        db.add(db_progress)
        
        # Automatically update the main task status if progress is complete
        if progress_in.progress == "100":
            db_task.status = "Completed"
            
        db.commit()
        db.refresh(db_progress)
        return db_progress

    @staticmethod
    def get_execution_report(db: Session, task_id: int):
        db_task = db.query(Task).filter(Task.id == task_id).first()
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")

        site_sessions = db.query(SiteAttendance).filter(
            SiteAttendance.task_id == task_id
        ).order_by(SiteAttendance.start_time.desc()).all()

        employee = db.query(Employee).filter(Employee.id == db_task.assigned_employee).first()

        timeline_events = []
        gps_points = []

        for session in site_sessions:
            if session.start_time:
                timeline_events.append({"type": "start", "label": "Trip Started", "timestamp": session.start_time.isoformat(), "icon": "play"})
            if session.reached_at:
                timeline_events.append({"type": "reached", "label": "Arrived at Site", "timestamp": session.reached_at.isoformat(), "icon": "map-pin"})
            if session.check_out:
                timeline_events.append({"type": "completed", "label": "Task Completed & Checked Out", "timestamp": session.check_out.isoformat(), "icon": "check-circle"})

            if session.attendance_id:
                query = db.query(LocationTracking).filter(LocationTracking.attendance_id == session.attendance_id)
                if session.start_time: query = query.filter(LocationTracking.timestamp >= session.start_time)
                if session.check_out: query = query.filter(LocationTracking.timestamp <= session.check_out)

                tracks = query.order_by(LocationTracking.timestamp.asc()).all()
                for track in tracks:
                    gps_points.append({"lat": track.lat, "lng": track.long, "timestamp": track.timestamp.isoformat(), "battery": track.battery, "network": track.network})

        timeline_events.sort(key=lambda x: x["timestamp"] if x["timestamp"] else "")

        photos = []
        for session in site_sessions:
            if session.photos:
                try:
                    parsed = json.loads(session.photos)
                    if isinstance(parsed, list): photos.extend(parsed)
                    else: photos.append(session.photos)
                except: photos.append(session.photos)

        if db_task.media_url and db_task.media_url not in photos:
            try:
                parsed = json.loads(db_task.media_url)
                if isinstance(parsed, list): photos.extend(parsed)
                else: photos.append(db_task.media_url)
            except: photos.append(db_task.media_url)

        return {
            "task": {
                "id": db_task.id, "title": db_task.title, "description": db_task.description,
                "location": db_task.location, "priority": db_task.priority, "status": db_task.status,
                "site_name": db_task.site_name, "assignee_name": db_task.assignee_name,
            },
            "employee": {
                "id": employee.id if employee else None,
                "name": employee.name if employee else "Unknown",
                "employee_id": employee.employee_id if employee else None,
            },
            "timeline": timeline_events,
            "gps_points": gps_points,
            "photos": photos,
            "notes": db_task.notes or (site_sessions[0].notes if site_sessions else None),
            "sessions": [{
                "id": s.id, "start_time": s.start_time.isoformat() if s.start_time else None,
                "reached_at": s.reached_at.isoformat() if s.reached_at else None,
                "check_in": s.check_in.isoformat() if s.check_in else None,
                "check_out": s.check_out.isoformat() if s.check_out else None,
                "status": s.status, "notes": s.notes,
            } for s in site_sessions]
        }
