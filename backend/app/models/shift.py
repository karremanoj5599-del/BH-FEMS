"""
FEMS - Shift Models
ShiftType, Shift, ShiftSwapRequest, ShiftBid, ShiftPolicy
"""
from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Text, DateTime, func, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class ShiftPolicy(Base):
    """Standalone policy entity — can be assigned to any shift type."""
    __tablename__ = "shift_policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    # Auto Shift
    is_auto_shift = Column(Boolean, default=False)

    # OT
    ot_formula = Column(String(50), nullable=True, default='not_applicable')
    ot_approval_role = Column(String(50), nullable=True, default='Manager')

    # Night Allowance
    night_allowance_enabled = Column(Boolean, default=False)

    # Week Off rules
    week_off_1_day = Column(String(10), nullable=True)
    week_off_2_day = Column(String(10), nullable=True)
    week_off_2_week = Column(String(10), nullable=True)

    # Highlights
    highlight_late_check_in = Column(Boolean, default=False)
    highlight_early_check_out = Column(Boolean, default=False)
    highlight_ot = Column(Boolean, default=False)
    highlight_week_off = Column(Boolean, default=False)

    # Relationships
    shift_types = relationship("ShiftType", back_populates="policy")


class ShiftType(Base):
    __tablename__ = "shift_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    grace_period = Column(Integer, default=15)
    break_rules = Column(Text, nullable=True)
    weekly_off_pattern = Column(String(100), nullable=True)
    ot_policy = Column(Text, nullable=True)
    is_auto_shift = Column(Boolean, default=False)

    # Legacy policy columns (kept for backward compat, unused by new UI)
    ot_formula = Column(String(50), nullable=True, default='not_applicable')
    ot_approval_role = Column(String(50), nullable=True, default='Manager')
    night_allowance_enabled = Column(Boolean, default=False)
    week_off_1_day = Column(String(10), nullable=True)
    week_off_2_day = Column(String(10), nullable=True)
    week_off_2_week = Column(String(10), nullable=True)

    # FK to ShiftPolicy
    policy_id = Column(Integer, ForeignKey("shift_policies.id"), nullable=True)
    policy = relationship("ShiftPolicy", back_populates="shift_types")

    shifts = relationship("Shift", back_populates="shift_type")
    bids = relationship("ShiftBid", back_populates="shift_type")


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    shift_type_id = Column(Integer, ForeignKey("shift_types.id"), nullable=False)
    shift_date = Column(Date, nullable=False, index=True)
    status = Column(String(30), default="Scheduled")

    employee = relationship("Employee", back_populates="shifts")
    shift_type = relationship("ShiftType", back_populates="shifts")
    swap_requests = relationship(
        "ShiftSwapRequest", 
        back_populates="shift",
        primaryjoin="Shift.id == ShiftSwapRequest.shift_id",
        foreign_keys="[ShiftSwapRequest.shift_id]"
    )


class ShiftSwapRequest(Base):
    __tablename__ = "shift_swap_requests"

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)
    target_shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=True)
    requested_by = Column(Integer, ForeignKey("employees.id"), nullable=False)
    swap_with_employee = Column(Integer, ForeignKey("employees.id"), nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(30), default="Pending")
    approved_by = Column(Integer, ForeignKey("employees.id"), nullable=True)
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

    shift = relationship("Shift", foreign_keys=[shift_id], back_populates="swap_requests")
    target_shift = relationship("Shift", foreign_keys=[target_shift_id])
    requester = relationship("Employee", foreign_keys=[requested_by], backref="swap_requests_made")
    swap_partner = relationship("Employee", foreign_keys=[swap_with_employee], backref="swap_requests_received")
    approver = relationship("Employee", foreign_keys=[approved_by], backref="swap_approvals")


class ShiftBid(Base):
    __tablename__ = "shift_bids"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    shift_type_id = Column(Integer, ForeignKey("shift_types.id"), nullable=False)
    points = Column(Integer, default=0)
    priority = Column(Integer, default=0)

    employee = relationship("Employee", back_populates="shift_bids")
    shift_type = relationship("ShiftType", back_populates="bids")
