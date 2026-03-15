from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class ShiftTypeBase(BaseModel):
    name: str
    start_time: time
    end_time: time
    grace_period: Optional[int] = 15
    break_rules: Optional[str] = None
    weekly_off_pattern: Optional[str] = None
    ot_policy: Optional[str] = None

class ShiftTypeCreate(ShiftTypeBase):
    pass

class ShiftTypeOut(ShiftTypeBase):
    id: int

    class Config:
        from_attributes = True

class ShiftBase(BaseModel):
    employee_id: int
    shift_type_id: int
    shift_date: date
    status: Optional[str] = "Scheduled"

class ShiftCreate(ShiftBase):
    pass

class ShiftOut(ShiftBase):
    id: int

    class Config:
        from_attributes = True

class ShiftSwapRequestBase(BaseModel):
    shift_id: int
    requested_by: int
    swap_with_employee: int
    reason: Optional[str] = None
    status: Optional[str] = "Pending"
    approved_by: Optional[int] = None

class ShiftSwapRequestCreate(ShiftSwapRequestBase):
    pass

class ShiftSwapRequestOut(ShiftSwapRequestBase):
    id: int

    class Config:
        from_attributes = True

class ShiftBidBase(BaseModel):
    employee_id: int
    shift_type_id: int
    points: Optional[int] = 0
    priority: Optional[int] = 0

class ShiftBidCreate(ShiftBidBase):
    pass

class ShiftBidOut(ShiftBidBase):
    id: int

    class Config:
        from_attributes = True
