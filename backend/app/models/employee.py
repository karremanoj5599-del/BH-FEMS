"""
FEMS - Employee, Skill, EmployeeSkill Models
"""
from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    profile_photo_url = Column(String(500), nullable=True)
    address = Column(Text, nullable=True)
    designation = Column(String(100), nullable=True)
    joining_date = Column(Date, nullable=True)
    emergency_contact_name = Column(String(200), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    
    # Foreign Keys
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    supervisor_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    
    status = Column(String(20), default="Active", index=True)  # Active / Inactive / Resigned
    type = Column(String(30), default="Permanent")  # Permanent / Contract / Daily-wage

    # Relationships
    role = relationship("Role", back_populates="employees")
    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])
    team = relationship("Team", back_populates="members", foreign_keys=[team_id])
    supervisor = relationship("Employee", remote_side=[id], foreign_keys=[supervisor_id], backref="subordinates")
    
    # Skills
    skills = relationship("EmployeeSkill", back_populates="employee", cascade="all, delete-orphan")
    
    # Operational Relationships (using string references to avoid circular imports)
    site_assignments = relationship("SiteAssignment", back_populates="employee", foreign_keys="SiteAssignment.employee_id")
    supervised_site_assignments = relationship("SiteAssignment", back_populates="supervisor", foreign_keys="SiteAssignment.supervisor_id")
    reported_issues = relationship("SiteIssue", back_populates="reporter")
    
    assigned_tasks = relationship("Task", back_populates="assignee")
    task_updates = relationship("TaskProgress", back_populates="updater")
    material_usage = relationship("MaterialUsage", back_populates="employee")
    
    attendance_records = relationship("Attendance", back_populates="employee")
    geofence_events = relationship("GeofenceEvent", back_populates="employee")
    
    shifts = relationship("Shift", back_populates="employee")
    shift_bids = relationship("ShiftBid", back_populates="employee")

    # Leave and Expense relationships
    expenses = relationship("Expense", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")
    leave_balances = relationship("LeaveBalance", back_populates="employee")
    
    def __repr__(self):
        return f"<Employee(id={self.id}, employee_id='{self.employee_id}', name='{self.name}')>"


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)

    employee_skills = relationship("EmployeeSkill", back_populates="skill")


class EmployeeSkill(Base):
    __tablename__ = "employee_skills"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    certificate_url = Column(String(500), nullable=True)
    expiry_date = Column(Date, nullable=True)

    employee = relationship("Employee", back_populates="skills")
    skill = relationship("Skill", back_populates="employee_skills")
