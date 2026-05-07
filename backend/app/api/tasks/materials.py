from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Employee
from app.schemas.task import MaterialUsageCreate, MaterialUsageOut
from app.services.task_service import TaskService

router = APIRouter()

@router.post("/{task_id}/materials", response_model=MaterialUsageOut)
def log_material_usage(
    task_id: int, 
    material_in: MaterialUsageCreate, 
    db: Session = Depends(get_db), 
    current_user: Employee = Depends(get_current_user)
):
    return TaskService.log_material_usage(db, task_id, material_in, current_user.id)
