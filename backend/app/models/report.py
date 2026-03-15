"""
FEMS - Report Models
Report, ReportSchedule
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)
    generated_at = Column(DateTime, nullable=False)
    file_url = Column(String(500), nullable=True)


class ReportSchedule(Base):
    __tablename__ = "report_schedules"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String(50), nullable=False)
    frequency = Column(String(20), nullable=False)
    recipient_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    recipient = relationship("Employee", backref="report_schedules_assigned")
