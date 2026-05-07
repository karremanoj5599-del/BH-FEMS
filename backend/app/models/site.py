"""
FEMS - Site Models
Site, SiteAssignment, SiteIssue
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    address = Column(Text, nullable=True)
    lat = Column(Float, nullable=True)
    long = Column(Float, nullable=True)
    geofence_radius = Column(Float, default=100.0)
    contact_person_name = Column(String(200), nullable=True)
    contact_person_phone = Column(String(20), nullable=True)
    contact_person_email = Column(String(200), nullable=True)
    site_type = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="Active", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assignments = relationship("SiteAssignment", back_populates="site", cascade="all, delete-orphan")
    issues = relationship("SiteIssue", back_populates="site", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="site", cascade="all, delete-orphan")
    site_attendances = relationship("SiteAttendance", back_populates="site", cascade="all, delete-orphan")
    geofence_events = relationship("GeofenceEvent", back_populates="site", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="linked_site")

    @property
    def assigned_employee_ids(self):
        return [a.employee_id for a in self.assignments]


class SiteAssignment(Base):
    __tablename__ = "site_assignments"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    supervisor_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    assigned_date = Column(Date, nullable=False)

    site = relationship("Site", back_populates="assignments")
    employee = relationship("Employee", foreign_keys=[employee_id], back_populates="site_assignments")
    supervisor = relationship("Employee", foreign_keys=[supervisor_id], back_populates="supervised_site_assignments")


class SiteIssue(Base):
    __tablename__ = "site_issues"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    reported_by = Column(Integer, ForeignKey("employees.id"), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), default="Medium")
    status = Column(String(20), default="Open")
    resolution_notes = Column(Text, nullable=True)
    created_date = Column(DateTime, nullable=False)
    resolved_date = Column(DateTime, nullable=True)

    site = relationship("Site", back_populates="issues")
    reporter = relationship("Employee", back_populates="reported_issues")
