from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ExpenseBase(BaseModel):
    type: str
    amount: float
    date_incurred: date
    receipt_url: Optional[str] = None
    status: Optional[str] = "Pending"
    linked_site_id: Optional[int] = None
    linked_task_id: Optional[int] = None
    gps_lat: Optional[float] = None
    gps_long: Optional[float] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseOut(ExpenseBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True

class ExpenseApprovalBase(BaseModel):
    expense_id: int
    status: Optional[str] = "Pending"
    comments: Optional[str] = None

class ExpenseApprovalCreate(ExpenseApprovalBase):
    pass

class ExpenseApprovalOut(ExpenseApprovalBase):
    id: int
    approver_id: int
    approved_date: Optional[datetime] = None

    class Config:
        from_attributes = True
