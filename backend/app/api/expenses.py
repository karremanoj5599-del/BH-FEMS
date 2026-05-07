from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Employee
from app.schemas.expense import (
    ExpenseCreate, ExpenseOut, ExpenseUpdate,
    ExpenseApprovalCreate, ExpenseApprovalOut
)
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.post("/", response_model=ExpenseOut)
def submit_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return ExpenseService.submit_expense(db, expense_in, current_user)

@router.post("/bulk", response_model=List[ExpenseOut])
def submit_bulk_expenses(expenses_in: List[ExpenseCreate], db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return ExpenseService.submit_bulk_expenses(db, expenses_in, current_user)

@router.get("/", response_model=List[ExpenseOut])
def get_expenses(
    skip: int = 0, 
    limit: int = 100, 
    status_filter: str = None, 
    employee_id: int = None, 
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    return ExpenseService.get_expenses(db, current_user, skip, limit, status_filter, employee_id)

@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    return ExpenseService.get_expense(db, expense_id)

@router.patch("/{expense_id}", response_model=ExpenseOut)
def update_expense_status(expense_id: int, status_data: dict, db: Session = Depends(get_db)):
    # Support for simple status update as used in frontend
    status = status_data.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    return ExpenseService.update_expense_status(db, expense_id, status)

@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, expense_in: ExpenseUpdate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return ExpenseService.update_expense(db, expense_id, expense_in, current_user)

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    ExpenseService.delete_expense(db, expense_id, current_user)
    return None

@router.post("/{expense_id}/approve", response_model=ExpenseApprovalOut)
def approve_expense(expense_id: int, approval_in: ExpenseApprovalCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return ExpenseService.approve_expense(db, expense_id, approval_in, current_user)
