"""
FEMS - Shift Models
ShiftType, Shift, ShiftSwapRequest, ShiftBid
"""
from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


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
    swap_requests = relationship("ShiftSwapRequest", back_populates="shift")


class ShiftSwapRequest(Base):
    __tablename__ = "shift_swap_requests"

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)
    requested_by = Column(Integer, ForeignKey("employees.id"), nullable=False)
    swap_with_employee = Column(Integer, ForeignKey("employees.id"), nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String(30), default="Pending")
    approved_by = Column(Integer, ForeignKey("employees.id"), nullable=True)

    shift = relationship("Shift", back_populates="swap_requests")
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
