from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Log, Employee
from app.schemas.log import LogCreate, LogOut

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.post("/", response_model=LogOut)
def create_log(log_in: LogCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    db_log = Log(**log_in.model_dump(), user_id=current_user.id, timestamp=datetime.utcnow())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/", response_model=List[LogOut])
def get_logs(
    skip: int = 0, 
    limit: int = 100, 
    user_id: int = None, 
    entity_type: str = None, 
    action: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Log)
    if user_id:
        query = query.filter(Log.user_id == user_id)
    if entity_type:
        query = query.filter(Log.entity_type == entity_type)
    if action:
        query = query.filter(Log.action == action)
        
    return query.order_by(Log.timestamp.desc()).offset(skip).limit(limit).all()
