from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.holiday import HolidayCreate, HolidayOut, HolidayUpdate
from app.services.misc_service import MiscService

router = APIRouter(prefix="/holidays", tags=["Holidays"])

@router.post("/", response_model=HolidayOut)
def create_holiday(holiday_in: HolidayCreate, db: Session = Depends(get_db)):
    return MiscService.create_holiday(db, holiday_in)

@router.get("/", response_model=List[HolidayOut])
def get_holidays(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return MiscService.get_holidays(db, skip, limit)

@router.put("/{holiday_id}", response_model=HolidayOut)
def update_holiday(holiday_id: int, holiday_in: HolidayUpdate, db: Session = Depends(get_db)):
    return MiscService.update_holiday(db, holiday_id, holiday_in)

@router.delete("/{holiday_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holiday(holiday_id: int, db: Session = Depends(get_db)):
    MiscService.delete_holiday(db, holiday_id)
    return None
