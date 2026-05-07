"""
FEMS - Leave Models
LeaveType, Leave, LeaveBalance
"""
from sqlalchemy import Column, Integer, String, Date, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class LeaveType(Base):
    __tablename__ = "leave_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    entitlement = Column(Integer, default=0)
    color = Column(String(50), nullable=True)
    carry_forward_rules = Column(Text, nullable=True)

    leaves = relationship("Leave", back_populates="leave_type")
    leave_balances = relationship("LeaveBalance", back_populates="leave_type")


class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    type_id = Column(Integer, ForeignKey("leave_types.id"), nullable=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)
    status = Column(String(20), default="Pending")
    reason = Column(Text, nullable=True)
    attachment_url = Column(String(500), nullable=True)

    employee = relationship("Employee", back_populates="leaves")
    leave_type = relationship("LeaveType", back_populates="leaves")


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    type_id = Column(Integer, ForeignKey("leave_types.id"), nullable=False)
    remaining = Column(Float, default=0)
    accrued = Column(Float, default=0)
    used = Column(Float, default=0)

    employee = relationship("Employee", back_populates="leave_balances")
    leave_type = relationship("LeaveType", back_populates="leave_balances")
