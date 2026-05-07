from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException

from app.models import Expense, ExpenseApproval, Employee
from app.schemas.expense import ExpenseCreate, ExpenseApprovalCreate, ExpenseUpdate

class ExpenseService:
    @staticmethod
    def submit_expense(db: Session, expense_in: ExpenseCreate, current_user: Employee):
        expense_data = expense_in.model_dump(exclude_unset=True)
        if "type" not in expense_data and "category" in expense_data:
            expense_data["type"] = expense_data["category"]
        elif "type" not in expense_data:
            expense_data["type"] = "Others"
            
        db_expense = Expense(**expense_data, employee_id=current_user.id)
        try:
            db.add(db_expense)
            db.commit()
            db.refresh(db_expense)
            return db_expense
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def submit_bulk_expenses(db: Session, expenses_in: List[ExpenseCreate], current_user: Employee):
        db_expenses = []
        try:
            for expense_in in expenses_in:
                expense_data = expense_in.model_dump(exclude_unset=True)
                if "type" not in expense_data and "category" in expense_data:
                    expense_data["type"] = expense_data["category"]
                elif "type" not in expense_data:
                    expense_data["type"] = "Others"
                    
                db_expense = Expense(**expense_data, employee_id=current_user.id)
                db.add(db_expense)
                db_expenses.append(db_expense)
                
            db.commit()
            for db_expense in db_expenses:
                db.refresh(db_expense)
            return db_expenses
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_expenses(
        db: Session,
        current_user: Employee,
        skip: int = 0, 
        limit: int = 100, 
        status_filter: str = None, 
        employee_id: int = None
    ):
        query = db.query(Expense).options(joinedload(Expense.employee))
        if current_user.role.name not in ["Admin", "HR", "Manager", "Supervisor"]:
            query = query.filter(Expense.employee_id == current_user.id)
        else:
            if employee_id:
                query = query.filter(Expense.employee_id == employee_id)
        if status_filter:
            query = query.filter(Expense.status == status_filter)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_expense(db: Session, expense_id: int):
        db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not db_expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        return db_expense

    @staticmethod
    def approve_expense(db: Session, expense_id: int, approval_in: ExpenseApprovalCreate, current_user: Employee):
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
    
    @staticmethod
    def update_expense_status(db: Session, expense_id: int, status: str):
        # Added for simple status update without full approval object
        db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not db_expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        db_expense.status = status
        db.commit()
        db.refresh(db_expense)
        return db_expense

    @staticmethod
    def update_expense(db: Session, expense_id: int, expense_in: ExpenseUpdate, current_user: Employee):
        db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not db_expense:
            raise HTTPException(status_code=404, detail="Expense not found")
        
        if db_expense.employee_id != current_user.id and current_user.role.name not in ["Admin", "HR", "Manager", "Supervisor"]:
            raise HTTPException(status_code=403, detail="Not authorized to update this expense")

        update_data = expense_in.model_dump(exclude_unset=True)
        if "category" in update_data and "type" not in update_data:
            update_data["type"] = update_data["category"]

        for key, value in update_data.items():
            setattr(db_expense, key, value)
            
        db.commit()
        db.refresh(db_expense)
        return db_expense

    @staticmethod
    def delete_expense(db: Session, expense_id: int, current_user: Employee):
        db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not db_expense:
            raise HTTPException(status_code=404, detail="Expense not found")

        if db_expense.employee_id != current_user.id and current_user.role.name not in ["Admin", "HR", "Manager", "Supervisor"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this expense")

        db.delete(db_expense)
        db.commit()
        return {"ok": True}
