from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Shift, ShiftType, ShiftSwapRequest
from app.schemas.shift import (
    ShiftCreate, ShiftOut,
    ShiftTypeCreate, ShiftTypeOut,
    ShiftSwapRequestCreate, ShiftSwapRequestOut
)

router = APIRouter(prefix="/shifts", tags=["Shifts"])

# ---- Shift Types ----
@router.post("/types", response_model=ShiftTypeOut)
def create_shift_type(shift_type_in: ShiftTypeCreate, db: Session = Depends(get_db)):
    db_shift_type = ShiftType(**shift_type_in.model_dump())
    db.add(db_shift_type)
    db.commit()
    db.refresh(db_shift_type)
    return db_shift_type

@router.get("/types", response_model=List[ShiftTypeOut])
def get_shift_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    shift_types = db.query(ShiftType).offset(skip).limit(limit).all()
    return shift_types

# ---- Shifts ----
@router.post("/", response_model=ShiftOut)
def assign_shift(shift_in: ShiftCreate, db: Session = Depends(get_db)):
    # Verify shift type exists
    db_shift_type = db.query(ShiftType).filter(ShiftType.id == shift_in.shift_type_id).first()
    if not db_shift_type:
        raise HTTPException(status_code=404, detail="Shift Type not found")
        
    db_shift = Shift(**shift_in.model_dump())
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift

@router.get("/", response_model=List[ShiftOut])
def get_shifts(skip: int = 0, limit: int = 100, employee_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Shift)
    if employee_id:
        query = query.filter(Shift.employee_id == employee_id)
    return query.offset(skip).limit(limit).all()

# ---- Shift Swaps ----
@router.post("/swap-requests", response_model=ShiftSwapRequestOut)
def request_shift_swap(swap_in: ShiftSwapRequestCreate, db: Session = Depends(get_db)):
    db_swap = ShiftSwapRequest(**swap_in.model_dump())
    db.add(db_swap)
    db.commit()
    db.refresh(db_swap)
    return db_swap

@router.get("/swap-requests", response_model=List[ShiftSwapRequestOut])
def get_swap_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(ShiftSwapRequest).offset(skip).limit(limit).all()

@router.put("/swap-requests/{swap_id}/status", response_model=ShiftSwapRequestOut)
def update_swap_status(swap_id: int, new_status: str, approved_by: int = None, db: Session = Depends(get_db)):
    db_swap = db.query(ShiftSwapRequest).filter(ShiftSwapRequest.id == swap_id).first()
    if not db_swap:
        raise HTTPException(status_code=404, detail="Swap Request not found")
    
    db_swap.status = new_status
    if approved_by:
        db_swap.approved_by = approved_by
        
    db.commit()
    db.refresh(db_swap)
    return db_swap
