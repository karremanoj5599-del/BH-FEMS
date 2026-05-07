from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import Holiday, Log
from app.schemas.holiday import HolidayCreate, HolidayUpdate
from app.schemas.log import LogCreate
from sqlalchemy.orm import joinedload
from datetime import datetime

class MiscService:
    # ---- Logs ----
    @staticmethod
    def get_logs(db: Session, skip: int = 0, limit: int = 100, user_id: int = None, entity_type: str = None, action: str = None):
        query = db.query(Log).options(joinedload(Log.user))
        if user_id: query = query.filter(Log.user_id == user_id)
        if entity_type: query = query.filter(Log.entity_type == entity_type)
        if action: query = query.filter(Log.action == action)
        return query.order_by(Log.timestamp.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create_log(db: Session, data: LogCreate, user_id: int):
        db_log = Log(**data.model_dump(), user_id=user_id, timestamp=datetime.utcnow())
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    # ---- Holidays ----
    @staticmethod
    def get_holidays(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Holiday).order_by(Holiday.holiday_date).offset(skip).limit(limit).all()

    @staticmethod
    def create_holiday(db: Session, data: HolidayCreate):
        if db.query(Holiday).filter(Holiday.holiday_date == data.holiday_date).first():
            raise HTTPException(status_code=400, detail="A holiday already exists on this date")
        holiday = Holiday(**data.model_dump())
        db.add(holiday)
        db.commit()
        db.refresh(holiday)
        return holiday

    @staticmethod
    def update_holiday(db: Session, holiday_id: int, data: HolidayUpdate):
        holiday = db.query(Holiday).filter(Holiday.id == holiday_id).first()
        if not holiday: raise HTTPException(status_code=404, detail="Holiday not found")
        
        update_data = data.model_dump(exclude_unset=True)
        if "holiday_date" in update_data:
            if db.query(Holiday).filter(Holiday.holiday_date == update_data["holiday_date"], Holiday.id != holiday_id).first():
                raise HTTPException(status_code=400, detail="A holiday already exists on this date")
        
        for key, value in update_data.items(): setattr(holiday, key, value)
        db.commit()
        db.refresh(holiday)
        return holiday

    @staticmethod
    def delete_holiday(db: Session, holiday_id: int):
        holiday = db.query(Holiday).filter(Holiday.id == holiday_id).first()
        if not holiday: raise HTTPException(status_code=404, detail="Holiday not found")
        db.delete(holiday)
        db.commit()
        return True
