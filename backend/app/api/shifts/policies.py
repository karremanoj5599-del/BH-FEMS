from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.shift import ShiftPolicyCreate, ShiftPolicyOut, ShiftPolicyUpdate
from app.services.shift_service import ShiftService

router = APIRouter()

@router.post("/policies", response_model=ShiftPolicyOut)
def create_policy(policy_in: ShiftPolicyCreate, db: Session = Depends(get_db)):
    return ShiftService.create_policy(db, policy_in)

@router.get("/policies", response_model=List[ShiftPolicyOut])
def get_policies(db: Session = Depends(get_db)):
    return ShiftService.get_policies(db)

@router.get("/policies/{policy_id}", response_model=ShiftPolicyOut)
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    # Simple direct query or service method:
    from app.models import ShiftPolicy
    from fastapi import HTTPException
    p = db.query(ShiftPolicy).filter(ShiftPolicy.id == policy_id).first()
    if not p: raise HTTPException(status_code=404, detail="Policy not found")
    return p

@router.put("/policies/{policy_id}", response_model=ShiftPolicyOut)
def update_policy(policy_id: int, policy_in: ShiftPolicyUpdate, db: Session = Depends(get_db)):
    return ShiftService.update_policy(db, policy_id, policy_in)

@router.delete("/policies/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_policy(policy_id: int, db: Session = Depends(get_db)):
    ShiftService.delete_policy(db, policy_id)
    return None
