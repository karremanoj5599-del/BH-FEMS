from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ExpenseBase(BaseModel):
    description: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    amount: float
    date_incurred: date
    receipt_url: Optional[str] = None
    status: Optional[str] = "Pending"
    reason: Optional[str] = None
    linked_site_id: Optional[int] = None
    linked_task_id: Optional[int] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    amount: Optional[float] = None
    date_incurred: Optional[date] = None
    receipt_url: Optional[str] = None
    status: Optional[str] = None
    reason: Optional[str] = None
    linked_site_id: Optional[int] = None
    linked_task_id: Optional[int] = None

class ExpenseEmployeeOut(BaseModel):
    id: int
    name: str
    employee_id: str

    class Config:
        from_attributes = True

class ExpenseOut(ExpenseBase):
    id: int
    employee_id: int
    employee: Optional[ExpenseEmployeeOut] = None

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
