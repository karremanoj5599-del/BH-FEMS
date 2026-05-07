from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.encoders import jsonable_encoder

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.attendance import (
    AttendanceCreate, AttendanceOut, 
    AttendanceCheckOut, AttendanceLive,
)
from app.models.employee import Employee
from app.models.attendance import Attendance, SiteAttendance
from app.services.attendance_service import AttendanceService

router = APIRouter()

@router.post("/check-in", response_model=AttendanceOut)
def check_in(
    attendance_in: AttendanceCreate, 
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    return AttendanceService.check_in(db, attendance_in, current_user.id)

@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    check_out_data: AttendanceCheckOut,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    return AttendanceService.check_out(db, check_out_data, current_user.id)

@router.get("/", response_model=List[AttendanceOut])
def get_all_attendance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Attendance).offset(skip).limit(limit).all()

@router.get("/me", response_model=List[AttendanceOut])
def get_my_attendance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return db.query(Attendance).filter(Attendance.employee_id == current_user.id).offset(skip).limit(limit).all()

@router.get("/live", response_model=List[AttendanceLive])
def get_live_attendance(db: Session = Depends(get_db)):
    return AttendanceService.get_live_attendance(db)

@router.get("/status")
def get_attendance_status(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    active_att = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.check_out == None
    ).order_by(Attendance.check_in.desc()).first()
    
    site_session = None
    if active_att:
        site_session = db.query(SiteAttendance).filter(
            SiteAttendance.attendance_id == active_att.id,
            SiteAttendance.check_out == None
        ).order_by(SiteAttendance.start_time.desc()).first()
        
    return jsonable_encoder({
        "app_session": active_att,
        "site_session": site_session,
        "is_clocked_in": active_att is not None
    })

@router.get("/{attendance_id}", response_model=AttendanceLive)
def get_attendance_detail(attendance_id: int, db: Session = Depends(get_db)):
    # Re-using live logic for a single record if needed, but for simplicity:
    active_records = AttendanceService.get_live_attendance(db)
    record = next((r for r in active_records if r["id"] == attendance_id), None)
    if not record:
        # Fallback to direct DB if not "live" (checked out)
        # But for the UI, this is mostly used for live tracking
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return record
