"""
Reports API Sub-package
Combines all report-related routers into a single router for main.py
"""
from fastapi import APIRouter

from app.api.reports.crud import router as crud_router
from app.api.reports.overview import router as overview_router
from app.api.reports.employee_daily import router as daily_router
from app.api.reports.employee_monthly import router as monthly_router

router = APIRouter(prefix="/reports", tags=["Reports"])

router.include_router(crud_router)
router.include_router(overview_router)
router.include_router(daily_router)
router.include_router(monthly_router)
