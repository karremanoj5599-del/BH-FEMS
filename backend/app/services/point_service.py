from sqlalchemy.orm import Session
from datetime import datetime, date
from fastapi import HTTPException
from app.models import Employee, PointTransaction

class PointService:
    @staticmethod
    def grant_points(db: Session, employee_id: int, amount: int, reason: str, admin_id: int):
        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        if not emp: raise HTTPException(status_code=404, detail="Employee not found")
        
        emp.points_balance = (emp.points_balance or 0) + amount
        db_transaction = PointTransaction(
            employee_id=employee_id,
            amount=amount,
            reason=f"Admin Grant: {reason}",
            reference_id=str(admin_id)
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(emp)
        return emp

    @staticmethod
    def reset_quarterly_points(db: Session):
        employees = db.query(Employee).filter(Employee.status == "Active").all()
        for emp in employees:
            old_balance = emp.points_balance or 0
            emp.points_balance = 200 # Reset to standard budget
            db.add(PointTransaction(
                employee_id=emp.id,
                amount=200 - old_balance,
                reason="Quarterly Points Reset"
            ))
        db.commit()
        return len(employees)

    @staticmethod
    def get_history(db: Session, employee_id: int, limit: int = 50):
        return db.query(PointTransaction).filter(PointTransaction.employee_id == employee_id).order_by(PointTransaction.created_at.desc()).limit(limit).all()
