from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import math
from fastapi import HTTPException
from sqlalchemy import or_

from app.models import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.core.security import hash_password

class EmployeeService:
    @staticmethod
    def get_minimal_list(db: Session):
        return db.query(Employee).filter(Employee.status == "Active").all()

    @staticmethod
    def get_employees(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: str = None,
        status_filter: str = None,
        department_id: int = None
    ):
        query = db.query(Employee).options(
            joinedload(Employee.role),
            joinedload(Employee.department),
            joinedload(Employee.team)
        )
        if search:
            query = query.filter(or_(
                Employee.name.ilike(f"%{search}%"),
                Employee.employee_id.ilike(f"%{search}%"),
                Employee.email.ilike(f"%{search}%"),
                Employee.phone.ilike(f"%{search}%"),
            ))
        if status_filter: query = query.filter(Employee.status == status_filter)
        if department_id: query = query.filter(Employee.department_id == department_id)

        total = query.count()
        total_pages = math.ceil(total / page_size) if total > 0 else 1
        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return items, total, total_pages

    @staticmethod
    def create_employee(db: Session, data: EmployeeCreate):
        if db.query(Employee).filter(Employee.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        if db.query(Employee).filter(Employee.employee_id == data.employee_id).first():
            raise HTTPException(status_code=400, detail="Employee ID already exists")

        emp = Employee(
            **data.model_dump(exclude={"password"}),
            password_hash=hash_password(data.password),
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)
        return emp

    @staticmethod
    def get_employee(db: Session, employee_id: int):
        emp = db.query(Employee).options(
            joinedload(Employee.role), 
            joinedload(Employee.department),
            joinedload(Employee.team)
        ).filter(Employee.id == employee_id).first()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        return emp

    @staticmethod
    def update_employee(db: Session, employee_id: int, data: EmployeeUpdate):
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        update_data = data.model_dump(exclude_unset=True)
        if "password" in update_data:
            password = update_data.pop("password")
            if password: emp.password_hash = hash_password(password)

        for key, value in update_data.items():
            setattr(emp, key, value)
            
        db.commit()
        db.refresh(emp)
        return emp

    @staticmethod
    def delete_employee(db: Session, employee_id: int):
        from app.models import (
            Employee, ExpenseApproval, ShiftSwapRequest
        )

        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")

        # 1. Update subordinates (set supervisor_id to null)
        db.query(Employee).filter(Employee.supervisor_id == employee_id).update({"supervisor_id": None})

        # 2. Cleanup records where employee was an approver or partner (not handled by cascade)
        # Expense Approvals
        db.query(ExpenseApproval).filter(ExpenseApproval.approver_id == employee_id).delete(synchronize_session=False)
        
        # Shift Swap Requests
        db.query(ShiftSwapRequest).filter(
            or_(
                ShiftSwapRequest.requested_by == employee_id,
                ShiftSwapRequest.swap_with_employee == employee_id,
                ShiftSwapRequest.approved_by == employee_id
            )
        ).delete(synchronize_session=False)

        # Notifications and Reports
        from app.models import NotificationRecipient, ReportSchedule, Log
        db.query(NotificationRecipient).filter(NotificationRecipient.employee_id == employee_id).delete(synchronize_session=False)
        db.query(ReportSchedule).filter(ReportSchedule.recipient_id == employee_id).delete(synchronize_session=False)
        db.query(Log).filter(Log.user_id == employee_id).update({"user_id": None})

        # 3. Finally delete the employee (SQLAlchemy cascade will handle the rest)
        db.delete(emp)
        db.commit()
        return True
