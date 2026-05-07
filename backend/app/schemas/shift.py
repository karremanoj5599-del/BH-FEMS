from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time, datetime


# ---- Shift Policy (standalone) ----
class ShiftPolicyBase(BaseModel):
    name: str
    is_auto_shift: Optional[bool] = False
    ot_formula: Optional[str] = 'not_applicable'
    ot_approval_role: Optional[str] = 'Manager'
    night_allowance_enabled: Optional[bool] = False
    week_off_1_day: Optional[str] = None
    week_off_2_day: Optional[str] = None
    week_off_2_week: Optional[str] = None
    highlight_late_check_in: Optional[bool] = False
    highlight_early_check_out: Optional[bool] = False
    highlight_ot: Optional[bool] = False
    highlight_week_off: Optional[bool] = False

class ShiftPolicyCreate(ShiftPolicyBase):
    pass

class ShiftPolicyUpdate(BaseModel):
    name: Optional[str] = None
    is_auto_shift: Optional[bool] = None
    ot_formula: Optional[str] = None
    ot_approval_role: Optional[str] = None
    night_allowance_enabled: Optional[bool] = None
    week_off_1_day: Optional[str] = None
    week_off_2_day: Optional[str] = None
    week_off_2_week: Optional[str] = None
    highlight_late_check_in: Optional[bool] = None
    highlight_early_check_out: Optional[bool] = None
    highlight_ot: Optional[bool] = None
    highlight_week_off: Optional[bool] = None

class ShiftPolicyOut(ShiftPolicyBase):
    id: int

    class Config:
        from_attributes = True


# ---- Shift Types ----
class ShiftTypeBase(BaseModel):
    name: str
    start_time: time
    end_time: time
    grace_period: Optional[int] = 15
    break_rules: Optional[str] = None
    weekly_off_pattern: Optional[str] = None
    ot_policy: Optional[str] = None
    is_auto_shift: Optional[bool] = False
    policy_id: Optional[int] = None

class ShiftTypeCreate(ShiftTypeBase):
    pass

class ShiftTypeUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    grace_period: Optional[int] = None
    break_rules: Optional[str] = None
    weekly_off_pattern: Optional[str] = None
    ot_policy: Optional[str] = None
    is_auto_shift: Optional[bool] = None
    policy_id: Optional[int] = None


class ShiftTypeOut(ShiftTypeBase):
    id: int
    policy: Optional[ShiftPolicyOut] = None

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
    shift_type: Optional[ShiftTypeOut] = None

    class Config:
        from_attributes = True

class ShiftSwapRequestBase(BaseModel):
    shift_id: int
    target_shift_id: Optional[int] = None
    requested_by: int
    swap_with_employee: int
    reason: Optional[str] = None
    status: Optional[str] = "Pending"
    approved_by: Optional[int] = None
    updated_at: Optional[datetime] = None

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

class ShiftBulkCreate(BaseModel):
    employee_id: int
    shifts: List[ShiftCreate]
