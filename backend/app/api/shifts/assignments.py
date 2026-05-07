from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.audit import log_activity
from app.models import Shift, Employee
from app.schemas.shift import ShiftCreate, ShiftOut, ShiftBulkCreate
from app.services.shift_service import ShiftService

router = APIRouter()

@router.post("/", response_model=ShiftOut)
def assign_shift(
    shift_in: ShiftCreate, 
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_shift = ShiftService.assign_shift(db, shift_in)
    log_activity(db, current_user.id, "CREATE", "Shift", db_shift.id, {"employee_id": db_shift.employee_id, "date": str(db_shift.shift_date)})
    return db_shift

@router.get("/", response_model=List[ShiftOut])
def get_shifts(
    skip: int = 0, 
    limit: int = 100, 
    employee_id: Optional[int] = None, 
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    return ShiftService.get_shifts(db, employee_id, start_date, end_date, skip, limit)

@router.post("/bulk")
def bulk_assign_shifts(
    bulk_in: ShiftBulkCreate, 
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    count = ShiftService.bulk_assign_shifts(db, bulk_in)
    log_activity(db, current_user.id, "CREATE", "ShiftBulk", None, {"employee_id": bulk_in.employee_id, "count": count})
    return {"message": f"Successfully assigned {count} shifts"}
    
@router.get("/my", response_model=List[ShiftOut])
def get_my_shifts(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    query = db.query(Shift).options(joinedload(Shift.shift_type)).filter(Shift.employee_id == current_user.id)
    if start_date: query = query.filter(Shift.shift_date >= start_date)
    if end_date: query = query.filter(Shift.shift_date <= end_date)
    return query.all()
