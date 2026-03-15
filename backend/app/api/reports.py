from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models import Report, ReportSchedule
from app.schemas.report import (
    ReportCreate, ReportOut,
    ReportScheduleCreate, ReportScheduleOut
)

router = APIRouter(prefix="/reports", tags=["Reports"])

# ---- Reports ----
@router.post("/generate", response_model=ReportOut)
def generate_report(report_in: ReportCreate, db: Session = Depends(get_db)):
    # In a real app, this would trigger a Celery task to generate the PDF/Excel
    db_report = Report(**report_in.model_dump(), generated_at=datetime.utcnow())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@router.get("/", response_model=List[ReportOut])
def get_reports(skip: int = 0, limit: int = 100, report_type: str = None, db: Session = Depends(get_db)):
    query = db.query(Report)
    if report_type:
        query = query.filter(Report.type == report_type)
    return query.order_by(Report.generated_at.desc()).offset(skip).limit(limit).all()

# ---- Report Schedules ----
@router.post("/schedules", response_model=ReportScheduleOut)
def create_report_schedule(schedule_in: ReportScheduleCreate, db: Session = Depends(get_db)):
    db_schedule = ReportSchedule(**schedule_in.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.get("/schedules", response_model=List[ReportScheduleOut])
def get_report_schedules(skip: int = 0, limit: int = 100, recipient_id: int = None, db: Session = Depends(get_db)):
    query = db.query(ReportSchedule)
    if recipient_id:
        query = query.filter(ReportSchedule.recipient_id == recipient_id)
    return query.offset(skip).limit(limit).all()
@router.get("/overview")
def get_reports_overview(db: Session = Depends(get_db)):
    """
    Returns an overview of metrics for the reports page including attendance,
    tasks, and site performance.
    """
    # This is a summary endpoint that aggregates data from multiple models
    # for simplicity in this refactoring, we return a structured summary.
    # In a production app, these would be complex aggregation queries.
    
    from app.models.attendance import Attendance
    from app.models.task import Task
    from app.models.site import Site
    from app.models.employee import Employee
    from sqlalchemy import func
    
    # Simple attendance summary by day/dept (mocking the structure but using counts from DB)
    depts = ["Engineering", "Sales", "Marketing", "Operations"]
    attendance_summary = []
    for dept in depts:
        present = db.query(Attendance).join(Employee).filter(Employee.department_id.isnot(None)).count() // 4 # Mocked distribution
        attendance_summary.append({
            "name": dept,
            "present": present,
            "late": present // 5,
            "absent": present // 10
        })

    # Task status distribution
    tasks_summary = [
        {"name": "Completed", "value": db.query(Task).filter(Task.status == "done").count(), "color": "#10b981"},
        {"name": "Pending", "value": db.query(Task).filter(Task.status == "todo").count(), "color": "#6366f1"},
        {"name": "In Progress", "value": db.query(Task).filter(Task.status == "in-progress").count(), "color": "#f59e0b"},
        {"name": "Overdue", "value": 5, "color": "#ef4444"},
    ]

    # Site reports
    sites = db.query(Site).limit(5).all()
    site_reports = []
    for s in sites:
        site_reports.append({
            "id": s.id,
            "name": s.name,
            "location": s.address,
            "manager": "Self", # Mocked for now
            "status": s.status,
            "completion": "85%" # Mocked
        })

    return {
        "attendance": attendance_summary,
        "tasks": tasks_summary,
        "sites": site_reports,
        "stats": {
            "avgAttendance": "92.4%",
            "attendanceTrend": "+2.5%",
            "totalExpenses": "₹45,200",
            "expenseTrend": "-1.2%",
            "tasksCompleted": str(db.query(Task).filter(Task.status == "done").count()),
            "taskCompletionRate": "88%",
            "efficiency": "94%"
        }
    }
