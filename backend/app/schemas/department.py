"""
FEMS - Pydantic Schemas for Departments
"""
from pydantic import BaseModel
from typing import Optional


class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    manager_id: Optional[int] = None
    status: Optional[str] = "Active"


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None
    status: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    manager_id: Optional[int] = None
    status: str
    manager_name: Optional[str] = None
    employee_count: Optional[int] = 0

    class Config:
        from_attributes = True
