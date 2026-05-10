from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import ShiftBid, Employee
from app.core.audit import log_activity

router = APIRouter(prefix="/bids", tags=["Shifts"])

@router.get("/")
def get_bids(db: Session = Depends(get_db)):
    return db.query(ShiftBid).all()

@router.put("/{bid_id}/status")
def update_bid_status(
    bid_id: int, 
    status: str, 
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    bid = db.query(ShiftBid).filter(ShiftBid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    old_status = bid.status
    bid.status = status
    db.commit()
    
    log_activity(db, current_user.id, "UPDATE", "ShiftBid", bid.id, {"old_status": old_status, "new_status": status})
    return {"message": f"Bid {bid_id} updated to {status}"}
