from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.attendance import LocationTrackingCreate, LocationTrackingOut
from app.models.employee import Employee
from app.models.attendance import LocationTracking
from app.services.attendance_service import AttendanceService

router = APIRouter()

@router.post("/sync-location", response_model=LocationTrackingOut)
def sync_location(
    location_in: LocationTrackingCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    return AttendanceService.sync_location(db, location_in, current_user.id)

@router.get("/{attendance_id}/timeline", response_model=List[LocationTrackingOut])
def get_attendance_timeline(attendance_id: int, db: Session = Depends(get_db)):
    return db.query(LocationTracking).filter(
        LocationTracking.attendance_id == attendance_id
    ).order_by(LocationTracking.timestamp.asc()).all()
