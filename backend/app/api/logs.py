from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Employee
from app.schemas.log import LogCreate, LogOut
from app.services.misc_service import MiscService

router = APIRouter(prefix="/logs", tags=["Logs"])

@router.post("/", response_model=LogOut)
def create_log(log_in: LogCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return MiscService.create_log(db, log_in, current_user.id)

@router.get("/", response_model=List[LogOut])
def get_logs(
    skip: int = 0, 
    limit: int = 100, 
    user_id: int = None, 
    entity_type: str = None, 
    action: str = None,
    db: Session = Depends(get_db)
):
    logs = MiscService.get_logs(db, skip, limit, user_id, entity_type, action)
    
    result = []
    for log in logs:
        out = LogOut.model_validate(log)
        out.user_name = log.user.name if log.user else "System"
        result.append(out)
        
    return result
