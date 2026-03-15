from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Attendance, LocationTracking, Employee
from app.schemas.attendance import (
    AttendanceCreate, AttendanceOut, 
    LocationTrackingCreate, LocationTrackingOut
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/check-in", response_model=AttendanceOut)
def check_in(attendance_in: AttendanceCreate, db: Session = Depends(get_db)):
    db_attendance = Attendance(**attendance_in.model_dump(), check_in=datetime.datetime.utcnow())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.post("/check-out/{attendance_id}", response_model=AttendanceOut)
def check_out(attendance_id: int, db: Session = Depends(get_db)):
    db_attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not db_attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    db_attendance.check_out = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

@router.get("/", response_model=List[AttendanceOut])
def get_all_attendance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    records = db.query(Attendance).offset(skip).limit(limit).all()
    return records

@router.get("/me", response_model=List[AttendanceOut])
def get_my_attendance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    records = db.query(Attendance).filter(Attendance.employee_id == current_user.id).offset(skip).limit(limit).all()
    return records

@router.post("/{attendance_id}/location", response_model=LocationTrackingOut)
def record_location(attendance_id: int, location_in: LocationTrackingCreate, db: Session = Depends(get_db)):
    db_attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not db_attendance:
         raise HTTPException(status_code=404, detail="Attendance record not found")

    db_track = LocationTracking(**location_in.model_dump(), attendance_id=attendance_id)
    db.add(db_track)
    db.commit()
    db.refresh(db_track)
    return db_track
