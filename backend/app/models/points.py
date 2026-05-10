from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # Positive for credit, negative for debit
    reason = Column(String(200), nullable=False) # e.g., "Task Completion", "Admin Grant", "Shift Bid"
    reference_id = Column(String(50), nullable=True) # e.g., task_id or bid_id
    created_at = Column(DateTime, default=func.now())

    employee = relationship("Employee", backref="point_history")
