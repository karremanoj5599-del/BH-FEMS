from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.audit import log_activity
from app.models import Employee
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut
from app.services.task_service import TaskService

router = APIRouter()

@router.post("/", response_model=TaskOut)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_task = TaskService.create_task(db, task_in, current_user.id)
    log_activity(db, current_user.id, "CREATE", "Task", db_task.id, {"title": db_task.title})
    return db_task

@router.get("/", response_model=List[TaskOut])
def get_tasks(
    skip: int = 0, 
    limit: int = 100, 
    site_id: int = None, 
    assigned_to: int = None, 
    status: str = None,
    priority: str = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    return TaskService.get_tasks(db, skip, limit, site_id, assigned_to, status, priority, start_date, end_date)

@router.get("/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)):
    return TaskService.get_task(db, task_id)

@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_task = TaskService.update_task(db, task_id, task_in)
    log_activity(db, current_user.id, "UPDATE", "Task", db_task.id, task_in.model_dump(exclude_unset=True))
    return db_task

@router.patch("/{task_id}", response_model=TaskOut)
def patch_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_task = TaskService.update_task(db, task_id, task_in)
    log_activity(db, current_user.id, "UPDATE", "Task", db_task.id, task_in.model_dump(exclude_unset=True))
    return db_task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_task = TaskService.get_task(db, task_id) # To get title for logging
    res = TaskService.delete_task(db, task_id)
    log_activity(db, current_user.id, "DELETE", "Task", task_id, {"title": db_task.title})
    return res
