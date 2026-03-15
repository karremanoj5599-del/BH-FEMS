from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Holiday
from app.schemas.holiday import HolidayCreate, HolidayOut

router = APIRouter(prefix="/holidays", tags=["Holidays"])

@router.post("/", response_model=HolidayOut)
def create_holiday(holiday_in: HolidayCreate, db: Session = Depends(get_db)):
    # Check for existing holiday on same date
    existing = db.query(Holiday).filter(Holiday.holiday_date == holiday_in.holiday_date).first()
    if existing:
        raise HTTPException(status_code=400, detail="A holiday already exists on this date")

    db_holiday = Holiday(**holiday_in.model_dump())
    db.add(db_holiday)
    db.commit()
    db.refresh(db_holiday)
    return db_holiday

@router.get("/", response_model=List[HolidayOut])
def get_holidays(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Holiday).order_by(Holiday.holiday_date).offset(skip).limit(limit).all()

@router.delete("/{holiday_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holiday(holiday_id: int, db: Session = Depends(get_db)):
    db_holiday = db.query(Holiday).filter(Holiday.id == holiday_id).first()
    if not db_holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")
        
    db.delete(db_holiday)
    db.commit()
    return None
