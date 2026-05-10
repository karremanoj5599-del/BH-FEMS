from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.point_service import PointService
from app.core.security import get_current_user
from app.models import Employee

router = APIRouter()

@router.post("/grant")
def grant_points(employee_id: int, amount: int, reason: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role_name not in ["Admin", "Super Admin"]:
        raise HTTPException(status_code=403, detail="Only admins can grant points")
    return PointService.grant_points(db, employee_id, amount, reason, current_user.id)

@router.post("/reset-quarterly")
def reset_points(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role_name not in ["Admin", "Super Admin"]:
        raise HTTPException(status_code=403, detail="Only admins can reset points")
    count = PointService.reset_quarterly_points(db)
    return {"message": f"Successfully reset points for {count} employees"}

@router.get("/history/{employee_id}")
def get_point_history(employee_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Employees can see their own history, Admins can see anyone's
    if current_user.id != employee_id and current_user.role_name not in ["Admin", "Super Admin", "HR", "Manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this history")
    return PointService.get_history(db, employee_id)

@router.get("/balance")
def get_my_balance(current_user = Depends(get_current_user)):
    return {"points_balance": current_user.points_balance}
