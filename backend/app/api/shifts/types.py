from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.shift import ShiftTypeCreate, ShiftTypeOut, ShiftTypeUpdate
from app.services.shift_service import ShiftService

router = APIRouter()

@router.post("/types", response_model=ShiftTypeOut)
def create_shift_type(shift_type_in: ShiftTypeCreate, db: Session = Depends(get_db)):
    return ShiftService.create_shift_type(db, shift_type_in)

@router.get("/types", response_model=List[ShiftTypeOut])
def get_shift_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return ShiftService.get_shift_types(db, skip, limit)

@router.put("/types/{type_id}", response_model=ShiftTypeOut)
def update_shift_type(type_id: int, shift_type_in: ShiftTypeUpdate, db: Session = Depends(get_db)):
    return ShiftService.update_shift_type(db, type_id, shift_type_in)

@router.delete("/types/{type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shift_type(type_id: int, db: Session = Depends(get_db)):
    ShiftService.delete_shift_type(db, type_id)
    return None
