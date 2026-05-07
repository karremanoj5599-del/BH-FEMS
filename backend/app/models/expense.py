"""
FEMS - Expense Models
Expense, ExpenseApproval
"""
from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    type = Column(String(50), nullable=True) # Keeping for backwards compatibility
    description = Column(String(255), nullable=True)
    category = Column(String(50), nullable=True)
    amount = Column(Float, nullable=False)
    date_incurred = Column(Date, nullable=False)
    receipt_url = Column(Text, nullable=True)
    status = Column(String(20), default="Pending")
    reason = Column(Text, nullable=True)
    linked_site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    linked_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    employee = relationship("Employee", back_populates="expenses")
    linked_site = relationship("Site", back_populates="expenses")
    linked_task = relationship("Task", back_populates="expenses")
    approvals = relationship("ExpenseApproval", back_populates="expense", cascade="all, delete-orphan")


class ExpenseApproval(Base):
    __tablename__ = "expense_approvals"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    approver_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    status = Column(String(20), default="Pending")
    comments = Column(Text, nullable=True)
    approved_date = Column(DateTime, nullable=True)

    expense = relationship("Expense", back_populates="approvals")
    approver = relationship("Employee", backref="expense_approvals_history")
