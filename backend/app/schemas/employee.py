"""
FEMS - Pydantic Schemas for Employees
"""
from pydantic import BaseModel
from typing import Optional
from datetime import date


class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    emergency_contact_phone: Optional[str] = None
    status: Optional[str] = "Active"
    type: Optional[str] = "Permanent"
    department_id: Optional[int] = None
    team_id: Optional[int] = None
    supervisor_id: Optional[int] = None
    role_id: Optional[int] = None


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None

    phone: Optional[str] = None

    address: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    emergency_contact_phone: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = None
    department_id: Optional[int] = None
    team_id: Optional[int] = None
    supervisor_id: Optional[int] = None
    role_id: Optional[int] = None


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    phone: Optional[str] = None
    profile_photo_url: Optional[str] = None
    address: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    emergency_contact_phone: Optional[str] = None
    status: str
    type: str
    department_id: Optional[int] = None
    team_id: Optional[int] = None
    supervisor_id: Optional[int] = None
    role_id: Optional[int] = None
    role_name: Optional[str] = None
    department_name: Optional[str] = None
    team_name: Optional[str] = None

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    items: list[EmployeeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
