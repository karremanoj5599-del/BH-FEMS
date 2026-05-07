"""
Attendance API Sub-package
Combines all attendance-related routers into a single router for main.py
"""
from fastapi import APIRouter

from app.api.attendance.checkin_out import router as checkin_router
from app.api.attendance.location import router as location_router
from app.api.attendance.site_execution import router as site_router

router = APIRouter(prefix="/attendance", tags=["Attendance"])

router.include_router(checkin_router)
router.include_router(location_router)
router.include_router(site_router)
