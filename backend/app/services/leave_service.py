from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date, timedelta
from sqlalchemy import or_, func, and_
from fastapi import HTTPException

from app.models import Leave, LeaveType, LeaveBalance, Employee, Holiday, Attendance
from app.schemas.leave import LeaveCreate, LeaveOut, LeaveBalanceOut, TeamCoverageOut, CompOffEarningOut
from app.core.audit import log_activity

class LeaveService:
    @staticmethod
    def create_leave_type(db: Session, type_in: any):
        db_type = LeaveType(**type_in.model_dump())
        db.add(db_type)
        db.commit()
        db.refresh(db_type)
        return db_type

    @staticmethod
    def get_leave_types(db: Session, skip: int = 0, limit: int = 100):
        return db.query(LeaveType).offset(skip).limit(limit).all()

    @staticmethod
    def apply_leave(db: Session, leave_in: LeaveCreate, current_user: Employee):
        try:
            db_type = db.query(LeaveType).filter(LeaveType.id == leave_in.type_id).first()
            if not db_type:
                raise HTTPException(status_code=404, detail="Leave Type not found")

            db_leave = Leave(**leave_in.model_dump(), employee_id=current_user.id)
            db.add(db_leave)
            db.commit()
            db.refresh(db_leave)
            
            log_activity(db, current_user.id, "CREATE", "Leave", db_leave.id, {"type": db_type.name, "from": str(db_leave.from_date)})
            
            out = LeaveOut.model_validate(db_leave)
            out.employee_name = current_user.name
            out.leave_type_name = db_type.name
            
            if db_leave.from_date and db_leave.to_date:
                delta = db_leave.to_date - db_leave.from_date
                out.days = delta.days + 1
                
            return out
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    def get_leaves(
        db: Session,
        skip: int = 0, 
        limit: int = 100, 
        employee_id: int = None, 
        search: str = None,
        status_filter: str = None
    ):
        query = db.query(Leave).options(
            joinedload(Leave.employee),
            joinedload(Leave.leave_type)
        )
        
        if employee_id:
            query = query.filter(Leave.employee_id == employee_id)
        
        if search:
            query = query.join(Employee).filter(
                or_(
                    Employee.name.ilike(f"%{search}%"),
                    Employee.employee_id.ilike(f"%{search}%")
                )
            )
            
        if status_filter:
            query = query.filter(Leave.status == status_filter)
            
        leaves = query.offset(skip).limit(limit).all()
        
        result = []
        for leave in leaves:
            out = LeaveOut.model_validate(leave)
            out.employee_name = leave.employee.name if leave.employee else "Unknown"
            out.leave_type_name = leave.leave_type.name if leave.leave_type else "Unknown"
            
            if leave.from_date and leave.to_date:
                delta = leave.to_date - leave.from_date
                out.days = delta.days + 1
            
            result.append(out)
            
        return result

    @staticmethod
    def update_leave_status(db: Session, leave_id: int, new_status: str, current_user: Employee):
        db_leave = db.query(Leave).filter(Leave.id == leave_id).first()
        if not db_leave:
            raise HTTPException(status_code=404, detail="Leave request not found")
            
        db_leave.status = new_status
        db.commit()
        db.refresh(db_leave)
        
        log_activity(db, current_user.id, "UPDATE", "Leave", db_leave.id, {"status": new_status})
        
        return db_leave

    @staticmethod
    def get_leave_balances(db: Session, employee_id: int, current_user: Employee):
        target_emp = employee_id if employee_id else current_user.id
        balances = db.query(LeaveBalance).options(
            joinedload(LeaveBalance.leave_type)
        ).filter(LeaveBalance.employee_id == target_emp).all()
        
        result = []
        for b in balances:
            out = LeaveBalanceOut.model_validate(b)
            out.leave_type_name = b.leave_type.name if b.leave_type else "Unknown"
            result.append(out)
            
        return result

    @staticmethod
    def get_team_coverage(db: Session):
        today = date.today()
        total_employees = db.query(Employee).filter(Employee.status == "Active").count()
        if total_employees == 0:
            return {"summary": "No active employees found", "days": []}
        
        coverage_days = []
        max_impact_date = None
        max_unavailable = 0
        
        for i in range(8):
            check_date = today + timedelta(days=i)
            unavailable_count = db.query(Leave).filter(
                Leave.status == "Approved",
                Leave.from_date <= check_date,
                Leave.to_date >= check_date
            ).count()
            
            impact_pct = (unavailable_count / total_employees) * 100
            level = "low"
            if impact_pct > 20: level = "medium"
            if impact_pct > 40: level = "high"
            
            reason = None
            if level == "high":
                reason = "High leave volume detected."
                if unavailable_count > max_unavailable:
                    max_unavailable = unavailable_count
                    max_impact_date = check_date
                    
            coverage_days.append({
                "date": check_date,
                "unavailable_count": unavailable_count,
                "total_count": total_employees,
                "impact_level": level,
                "reason": reason
            })
            
        summary = "Team coverage is healthy for the next week."
        if max_impact_date:
            summary = f"High leave volume in your team for {max_impact_date.strftime('%B %d')}. Approval may be delayed."
            
        return {"summary": summary, "days": coverage_days}

    @staticmethod
    def get_comp_off_earnings(db: Session, current_user: Employee):
        holidays = db.query(Holiday).all()
        holiday_dates = {h.holiday_date: h.name for h in holidays}
        
        sixty_days_ago = datetime.utcnow() - timedelta(days=60)
        attendance = db.query(Attendance).filter(
            Attendance.employee_id == current_user.id,
            Attendance.check_in >= sixty_days_ago,
            Attendance.check_out.isnot(None)
        ).all()
        
        earnings = []
        for att in attendance:
            att_date = att.check_in.date()
            if att_date in holiday_dates:
                earnings.append({
                    "date": att_date,
                    "label": f"Worked: {holiday_dates[att_date]}",
                    "days_earned": 1.0,
                    "type": "Holiday"
                })
                continue
            if att_date.weekday() >= 5:
                day_name = "Saturday" if att_date.weekday() == 5 else "Sunday"
                earnings.append({
                    "date": att_date,
                    "label": f"Worked: {day_name}, {att_date.strftime('%B %d')}",
                    "days_earned": 1.0,
                    "type": "Weekend"
                })
        earnings.sort(key=lambda x: x["date"], reverse=True)
        return earnings[:5]
