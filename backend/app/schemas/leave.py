from pydantic import BaseModel
from typing import Optional
from datetime import date

class LeaveTypeBase(BaseModel):
    name: str
    entitlement: Optional[int] = 0
    carry_forward_rules: Optional[str] = None

class LeaveTypeCreate(LeaveTypeBase):
    pass

class LeaveTypeOut(LeaveTypeBase):
    id: int

    class Config:
        from_attributes = True

class LeaveBase(BaseModel):
    type_id: int
    from_date: date
    to_date: date
    status: Optional[str] = "Pending"
    reason: Optional[str] = None
    attachment_url: Optional[str] = None

class LeaveCreate(LeaveBase):
    pass

class LeaveOut(LeaveBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True

class LeaveBalanceBase(BaseModel):
    employee_id: int
    type_id: int
    remaining: Optional[float] = 0
    accrued: Optional[float] = 0
    used: Optional[float] = 0

class LeaveBalanceUpdate(BaseModel):
    remaining: Optional[float] = None
    accrued: Optional[float] = None
    used: Optional[float] = None

class LeaveBalanceOut(LeaveBalanceBase):
    id: int

    class Config:
        from_attributes = True
