from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Expense, ExpenseApproval, Employee
from app.schemas.expense import (
    ExpenseCreate, ExpenseOut,
    ExpenseApprovalCreate, ExpenseApprovalOut
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.post("/", response_model=ExpenseOut)
def submit_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    db_expense = Expense(**expense_in.model_dump(), employee_id=current_user.id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/", response_model=List[ExpenseOut])
def get_expenses(skip: int = 0, limit: int = 100, status_filter: str = None, employee_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Expense)
    if status_filter:
        query = query.filter(Expense.status == status_filter)
    if employee_id:
        query = query.filter(Expense.employee_id == employee_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense

@router.post("/{expense_id}/approve", response_model=ExpenseApprovalOut)
def approve_expense(expense_id: int, approval_in: ExpenseApprovalCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    db_approval = ExpenseApproval(
        **approval_in.model_dump(), 
        approver_id=current_user.id,
        approved_date=datetime.utcnow() if approval_in.status == "Approved" else None
    )
    db.add(db_approval)
    db_expense.status = approval_in.status
    
    db.commit()
    db.refresh(db_approval)
    return db_approval
