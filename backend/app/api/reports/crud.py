from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models import Report, ReportSchedule
from app.schemas.report import (
    ReportCreate, ReportOut,
    ReportScheduleCreate, ReportScheduleOut
)

router = APIRouter()

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
