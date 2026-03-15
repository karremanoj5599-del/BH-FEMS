from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Task, TaskProgress, MaterialUsage, Employee
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskOut,
    TaskProgressCreate, TaskProgressOut,
    MaterialUsageCreate, MaterialUsageOut
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])

# ---- Tasks ----
@router.post("/", response_model=TaskOut)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(**task_in.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[TaskOut])
def get_tasks(skip: int = 0, limit: int = 100, site_id: int = None, assigned_to: int = None, db: Session = Depends(get_db)):
    query = db.query(Task)
    if site_id:
        query = query.filter(Task.site_id == site_id)
    if assigned_to:
        query = query.filter(Task.assigned_employee == assigned_to)
    return query.offset(skip).limit(limit).all()

@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

# ---- Task Progress ----
@router.post("/{task_id}/progress", response_model=TaskProgressOut)
def create_task_progress(task_id: int, progress_in: TaskProgressCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db_progress = TaskProgress(
        **progress_in.model_dump(), 
        updated_by=current_user.id, 
        updated_date=datetime.utcnow()
    )
    db.add(db_progress)

    # Automatically update the main task status if progress is complete
    if progress_in.progress == "100":
        db_task.status = "Completed"

    db.commit()
    db.refresh(db_progress)
    return db_progress

# ---- Material Usage ----
@router.post("/{task_id}/materials", response_model=MaterialUsageOut)
def log_material_usage(task_id: int, material_in: MaterialUsageCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_material = MaterialUsage(**material_in.model_dump(), employee_id=current_user.id)
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material
