from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Employee
from app.schemas.leave import (
    LeaveCreate, LeaveOut,
    LeaveTypeCreate, LeaveTypeOut,
    LeaveBalanceOut,
    TeamCoverageOut, CompOffEarningOut
)
from app.services.leave_service import LeaveService

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post("/types", response_model=LeaveTypeOut)
def create_leave_type(type_in: LeaveTypeCreate, db: Session = Depends(get_db)):
    return LeaveService.create_leave_type(db, type_in)

@router.get("/types", response_model=List[LeaveTypeOut])
def get_leave_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return LeaveService.get_leave_types(db, skip, limit)

@router.post("/", response_model=LeaveOut)
def apply_leave(leave_in: LeaveCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return LeaveService.apply_leave(db, leave_in, current_user)

@router.get("/", response_model=List[LeaveOut])
def get_leaves(
    skip: int = 0, 
    limit: int = 100, 
    employee_id: int = None, 
    search: str = None,
    status_filter: str = None, 
    db: Session = Depends(get_db)
):
    return LeaveService.get_leaves(db, skip, limit, employee_id, search, status_filter)

@router.put("/{leave_id}/status", response_model=LeaveOut)
def update_leave_status(
    leave_id: int, 
    new_status: str, 
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    return LeaveService.update_leave_status(db, leave_id, new_status, current_user)

@router.get("/balances", response_model=List[LeaveBalanceOut])
def get_leave_balances(employee_id: int = None, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return LeaveService.get_leave_balances(db, employee_id, current_user)

@router.get("/coverage", response_model=TeamCoverageOut)
def get_team_coverage(db: Session = Depends(get_db)):
    return LeaveService.get_team_coverage(db)

@router.get("/comp-off-earnings", response_model=List[CompOffEarningOut])
def get_comp_off_earnings(db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    return LeaveService.get_comp_off_earnings(db, current_user)
