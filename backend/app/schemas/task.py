from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class TaskBase(BaseModel):
    site_id: int
    assigned_employee: int
    description: str
    deadline: Optional[date] = None
    status: Optional[str] = "Pending"
    priority: Optional[str] = "Medium"
    is_recurring: Optional[bool] = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    is_recurring: Optional[bool] = None

class TaskOut(TaskBase):
    id: int

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
