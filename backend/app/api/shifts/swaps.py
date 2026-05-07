from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import ShiftSwapRequest
from app.schemas.shift import ShiftSwapRequestCreate, ShiftSwapRequestOut

router = APIRouter()

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
