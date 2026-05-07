from pydantic import BaseModel
from typing import Optional
from datetime import date

class LeaveTypeBase(BaseModel):
    name: str
    entitlement: Optional[int] = 0
    color: Optional[str] = None
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
    employee_name: Optional[str] = None
    leave_type_name: Optional[str] = None
    days: Optional[int] = None


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
    leave_type_name: Optional[str] = None

    class Config:
        from_attributes = True

class CoverageDay(BaseModel):
    date: date
    unavailable_count: int
    total_count: int
    impact_level: str # 'low', 'medium', 'high'
    reason: Optional[str] = None

class TeamCoverageOut(BaseModel):
    summary: str
    days: list[CoverageDay]

class CompOffEarningOut(BaseModel):
    date: date
    label: str # e.g. "Worked: Sunday, March 8"
    days_earned: float
    type: str # 'Holiday' or 'Weekend'
