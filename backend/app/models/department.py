"""
FEMS - Department Model
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey
# No direct import of Employee to avoid circularity - SQLAlchemy uses string references
from sqlalchemy.orm import relationship
from app.core.database import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    status = Column(String(20), default="Active")  # Active / Inactive

    # Relationships
    manager = relationship("Employee", foreign_keys=[manager_id], backref="managed_departments")
    employees = relationship("Employee", back_populates="department", foreign_keys="Employee.department_id")
    teams = relationship("Team", back_populates="department")

    def __repr__(self):
        return f"<Department(id={self.id}, name='{self.name}')>"
