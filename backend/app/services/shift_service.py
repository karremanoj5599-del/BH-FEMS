from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date
from fastapi import HTTPException, status

from app.models import Shift, ShiftType, ShiftPolicy
from app.schemas.shift import ShiftCreate, ShiftBulkCreate, ShiftTypeCreate, ShiftTypeUpdate, ShiftPolicyCreate, ShiftPolicyUpdate

class ShiftService:
    # ---- Shift Assignments ----
    @staticmethod
    def assign_shift(db: Session, shift_in: ShiftCreate):
        db_shift_type = db.query(ShiftType).filter(ShiftType.id == shift_in.shift_type_id).first()
        if not db_shift_type: raise HTTPException(status_code=404, detail="Shift Type not found")
        db_shift = Shift(**shift_in.model_dump())
        db.add(db_shift)
        db.commit()
        db.refresh(db_shift)
        return db_shift

    @staticmethod
    def get_shifts(db: Session, employee_id: Optional[int] = None, start_date: Optional[date] = None, end_date: Optional[date] = None, skip: int = 0, limit: int = 100):
        query = db.query(Shift)
        if employee_id: query = query.filter(Shift.employee_id == employee_id)
        if start_date: query = query.filter(Shift.shift_date >= start_date)
        if end_date: query = query.filter(Shift.shift_date <= end_date)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def bulk_assign_shifts(db: Session, bulk_in: ShiftBulkCreate):
        dates = [s.shift_date for s in bulk_in.shifts]
        db.query(Shift).filter(Shift.employee_id == bulk_in.employee_id, Shift.shift_date.in_(dates)).delete(synchronize_session=False)
        new_shifts = [Shift(**s_in.model_dump()) for s_in in bulk_in.shifts]
        db.add_all(new_shifts)
        db.commit()
        return len(new_shifts)

    # ---- Shift Types ----
    @staticmethod
    def create_shift_type(db: Session, shift_type_in: ShiftTypeCreate):
        if db.query(ShiftType).filter(ShiftType.name == shift_type_in.name).first():
            raise HTTPException(status_code=400, detail="Shift type with this name already exists")
        db_shift_type = ShiftType(**shift_type_in.model_dump())
        db.add(db_shift_type)
        db.commit()
        db.refresh(db_shift_type)
        return db_shift_type

    @staticmethod
    def get_shift_types(db: Session, skip: int = 0, limit: int = 100):
        return db.query(ShiftType).options(joinedload(ShiftType.policy)).offset(skip).limit(limit).all()

    @staticmethod
    def update_shift_type(db: Session, type_id: int, shift_type_in: ShiftTypeUpdate):
        db_shift_type = db.query(ShiftType).filter(ShiftType.id == type_id).first()
        if not db_shift_type: raise HTTPException(status_code=404, detail="Shift Type not found")
        update_data = shift_type_in.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != db_shift_type.name:
            if db.query(ShiftType).filter(ShiftType.name == update_data["name"]).first():
                raise HTTPException(status_code=400, detail="Another shift type with this name already exists")
        for key, value in update_data.items(): setattr(db_shift_type, key, value)
        db.commit()
        db.refresh(db_shift_type)
        return db_shift_type

    @staticmethod
    def delete_shift_type(db: Session, type_id: int):
        db_shift_type = db.query(ShiftType).filter(ShiftType.id == type_id).first()
        if not db_shift_type: raise HTTPException(status_code=404, detail="Shift Type not found")
        if db.query(Shift).filter(Shift.shift_type_id == type_id).first():
            raise HTTPException(status_code=400, detail="Cannot delete Shift Type that has active shift assignments")
        db.delete(db_shift_type)
        db.commit()
        return True

    # ---- Shift Policies ----
    @staticmethod
    def create_policy(db: Session, policy_in: ShiftPolicyCreate):
        if db.query(ShiftPolicy).filter(ShiftPolicy.name == policy_in.name).first():
            raise HTTPException(status_code=400, detail="Policy with this name already exists")
        db_policy = ShiftPolicy(**policy_in.model_dump())
        db.add(db_policy)
        db.commit()
        db.refresh(db_policy)
        return db_policy

    @staticmethod
    def get_policies(db: Session):
        return db.query(ShiftPolicy).all()

    @staticmethod
    def update_policy(db: Session, policy_id: int, policy_in: ShiftPolicyUpdate):
        p = db.query(ShiftPolicy).filter(ShiftPolicy.id == policy_id).first()
        if not p: raise HTTPException(status_code=404, detail="Policy not found")
        update_data = policy_in.model_dump(exclude_unset=True)
        if "name" in update_data and update_data["name"] != p.name:
            if db.query(ShiftPolicy).filter(ShiftPolicy.name == update_data["name"]).first():
                raise HTTPException(status_code=400, detail="Another policy with this name already exists")
        for key, value in update_data.items(): setattr(p, key, value)
        db.commit()
        db.refresh(p)
        return p

    @staticmethod
    def delete_policy(db: Session, policy_id: int):
        p = db.query(ShiftPolicy).filter(ShiftPolicy.id == policy_id).first()
        if not p: raise HTTPException(status_code=404, detail="Policy not found")
        if db.query(ShiftType).filter(ShiftType.policy_id == policy_id).first():
            raise HTTPException(status_code=400, detail="Cannot delete policy that is assigned to shift types.")
        db.delete(p)
        db.commit()
        return True
