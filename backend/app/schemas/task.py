from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class TaskBase(BaseModel):
    title: Optional[str] = None
    site_id: Optional[int] = None
    location: Optional[str] = None
    assigned_employee: int
    description: str
    deadline: Optional[date] = None
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    is_recurring: Optional[bool] = False
    notes: Optional[str] = None
    media_url: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    site_id: Optional[int] = None
    location: Optional[str] = None
    assigned_employee: Optional[int] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    is_recurring: Optional[bool] = None
    notes: Optional[str] = None
    media_url: Optional[str] = None

class TaskOut(TaskBase):
    id: int
    site_name: Optional[str] = None
    assignee_name: Optional[str] = None
    start_time: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskProgressBase(BaseModel):
    task_id: int
    progress: Optional[str] = None
    notes: Optional[str] = None
    photos: Optional[str] = None

class TaskProgressCreate(TaskProgressBase):
    pass

class TaskProgressOut(TaskProgressBase):
    id: int
    updated_by: int
    updated_date: datetime

    class Config:
        from_attributes = True

class MaterialUsageBase(BaseModel):
    task_id: int
    material_name: str
    quantity: float
    used_date: date

class MaterialUsageCreate(MaterialUsageBase):
    pass

class MaterialUsageOut(MaterialUsageBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True
