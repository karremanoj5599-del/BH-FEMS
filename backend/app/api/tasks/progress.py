from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Employee
from app.schemas.task import TaskProgressCreate, TaskProgressOut
from app.services.task_service import TaskService

router = APIRouter()

@router.post("/{task_id}/progress", response_model=TaskProgressOut)
def create_task_progress(
    task_id: int, 
    progress_in: TaskProgressCreate, 
    db: Session = Depends(get_db), 
    current_user: Employee = Depends(get_current_user)
):
    return TaskService.create_progress(db, task_id, progress_in, current_user.id)
