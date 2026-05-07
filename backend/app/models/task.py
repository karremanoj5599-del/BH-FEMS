"""
FEMS - Task Models
Task, TaskProgress, MaterialUsage
"""
from sqlalchemy import Column, Integer, String, Date, Text, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True, index=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    location = Column(String(500), nullable=True)
    assigned_employee = Column(Integer, ForeignKey("employees.id"), nullable=False)
    description = Column(Text, nullable=False)
    deadline = Column(Date, nullable=True)
    status = Column(String(30), default="Pending")
    priority = Column(String(20), default="Medium")
    is_recurring = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    media_url = Column(Text, nullable=True)

    site = relationship("Site", back_populates="tasks")
    assignee = relationship("Employee", back_populates="assigned_tasks")
    progress_entries = relationship("TaskProgress", back_populates="task", cascade="all, delete-orphan")
    material_usage = relationship("MaterialUsage", back_populates="task", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="linked_task") # Expenses should probably NOT be deleted with task? Or should they?
    site_attendances = relationship("SiteAttendance", back_populates="task")

    @property
    def site_name(self):
        return self.site.name if self.site else None

    @property
    def assignee_name(self):
        return self.assignee.name if self.assignee else None

    @property
    def start_time(self):
        # Get the earliest start_time from linked site_attendances
        starts = [sa.start_time for sa in self.site_attendances if sa.start_time]
        return min(starts) if starts else None


class TaskProgress(Base):
    __tablename__ = "task_progress"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    progress = Column(String(10), nullable=True)
    notes = Column(Text, nullable=True)
    photos = Column(Text, nullable=True)
    updated_by = Column(Integer, ForeignKey("employees.id"), nullable=False)
    updated_date = Column(DateTime, nullable=False)

    task = relationship("Task", back_populates="progress_entries")
    updater = relationship("Employee", back_populates="task_updates")


class MaterialUsage(Base):
    __tablename__ = "material_usage"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    material_name = Column(String(200), nullable=False)
    quantity = Column(Float, default=0)
    used_date = Column(Date, nullable=False)

    task = relationship("Task", back_populates="material_usage")
    employee = relationship("Employee", back_populates="material_usage")
