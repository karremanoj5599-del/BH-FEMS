from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Leave, LeaveType, LeaveBalance, Employee
from app.schemas.leave import (
    LeaveCreate, LeaveOut,
    LeaveTypeCreate, LeaveTypeOut,
    LeaveBalanceUpdate, LeaveBalanceOut
)

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post("/types", response_model=LeaveTypeOut)
def create_leave_type(type_in: LeaveTypeCreate, db: Session = Depends(get_db)):
    db_type = LeaveType(**type_in.model_dump())
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type

@router.get("/types", response_model=List[LeaveTypeOut])
def get_leave_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(LeaveType).offset(skip).limit(limit).all()

@router.post("/", response_model=LeaveOut)
def apply_leave(leave_in: LeaveCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    db_type = db.query(LeaveType).filter(LeaveType.id == leave_in.type_id).first()
    if not db_type:
        raise HTTPException(status_code=404, detail="Leave Type not found")

    db_leave = Leave(**leave_in.model_dump(), employee_id=current_user.id)
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.get("/", response_model=List[LeaveOut])
def get_leaves(skip: int = 0, limit: int = 100, employee_id: int = None, status_filter: str = None, db: Session = Depends(get_db)):
    query = db.query(Leave)
    if employee_id:
        query = query.filter(Leave.employee_id == employee_id)
    if status_filter:
        query = query.filter(Leave.status == status_filter)
    return query.offset(skip).limit(limit).all()

@router.put("/{leave_id}/status", response_model=LeaveOut)
def update_leave_status(leave_id: int, new_status: str, db: Session = Depends(get_db)):
    db_leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    db_leave.status = new_status
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.get("/balances", response_model=List[LeaveBalanceOut])
def get_leave_balances(employee_id: int = None, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    target_emp = employee_id if employee_id else current_user.id
    return db.query(LeaveBalance).filter(LeaveBalance.employee_id == target_emp).all()
