"""
FEMS - Team Model
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    team_lead_id = Column(Integer, ForeignKey("employees.id"), nullable=True)

    # Relationships
    department = relationship("Department", back_populates="teams")
    team_lead = relationship("Employee", foreign_keys=[team_lead_id], backref="led_teams")
    members = relationship("Employee", back_populates="team", foreign_keys="Employee.team_id")

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}')>"
