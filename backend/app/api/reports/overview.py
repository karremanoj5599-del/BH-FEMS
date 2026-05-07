from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.report_service import ReportService

router = APIRouter()

@router.get("/overview")
def get_reports_overview(date: str = None, db: Session = Depends(get_db)):
    return ReportService.get_overview(db, date)
