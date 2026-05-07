from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
import json
from fastapi.encoders import jsonable_encoder

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.attendance import SiteAttendanceOut
from app.models.employee import Employee
from app.models.attendance import Attendance, SiteAttendance
from app.services.attendance_service import AttendanceService

router = APIRouter()

@router.post("/site/start", response_model=SiteAttendanceOut)
def start_site_session(
    site_id: Optional[int] = None,
    task_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    return AttendanceService.start_site_session(db, site_id, task_id, current_user.id)

@router.post("/site/{site_att_id}/check-in", response_model=SiteAttendanceOut)
def site_check_in(
    site_att_id: int,
    db: Session = Depends(get_db)
):
    return AttendanceService.site_check_in(db, site_att_id)

@router.post("/site/{site_att_id}/complete", response_model=SiteAttendanceOut)
def site_complete(
    site_att_id: int,
    notes: str,
    photos: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return AttendanceService.site_complete(db, site_att_id, notes, photos)

@router.post("/site/{site_att_id}/check-out", response_model=SiteAttendanceOut)
def site_check_out(
    site_att_id: int,
    db: Session = Depends(get_db)
):
    return AttendanceService.site_check_out(db, site_att_id)

@router.get("/site/active-sessions")
def get_active_sessions(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    active_att = db.query(Attendance).filter(
        Attendance.employee_id == current_user.id,
        Attendance.check_out == None
    ).order_by(Attendance.check_in.desc()).first()
    
    if not active_att:
        return {"sessions": [], "is_clocked_in": False}
    
    sessions = db.query(SiteAttendance).filter(
        SiteAttendance.attendance_id == active_att.id,
        SiteAttendance.check_out == None
    ).all()
    
    return jsonable_encoder({
        "sessions": sessions,
        "is_clocked_in": True
    })

@router.get("/site/{site_att_id}/timeline")
def get_site_timeline(
    site_att_id: int,
    db: Session = Depends(get_db),
):
    db_site_att = db.query(SiteAttendance).filter(SiteAttendance.id == site_att_id).first()
    if not db_site_att:
        raise HTTPException(status_code=404, detail="Site session not found")
    
    timeline = []
    if db_site_att.execution_timeline:
        try: timeline = json.loads(db_site_att.execution_timeline)
        except: timeline = []
    
    return {
        "session_id": db_site_att.id,
        "site_id": db_site_att.site_id,
        "task_id": db_site_att.task_id,
        "status": db_site_att.status,
        "timeline": timeline
    }
