from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.task_service import TaskService

router = APIRouter()

@router.get("/{task_id}/execution-report")
def get_execution_report(task_id: int, db: Session = Depends(get_db)):
    return TaskService.get_execution_report(db, task_id)
