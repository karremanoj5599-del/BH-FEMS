"""
Shifts API Sub-package
Combines all shift-related routers into a single router for main.py
"""
from fastapi import APIRouter

from app.api.shifts.policies import router as policies_router
from app.api.shifts.types import router as types_router
from app.api.shifts.assignments import router as assignments_router
from app.api.shifts.swaps import router as swaps_router
from app.api.shifts.bids import router as bids_router

router = APIRouter(prefix="/shifts", tags=["Shifts"])

router.include_router(policies_router)
router.include_router(types_router)
router.include_router(assignments_router)
router.include_router(swaps_router)
router.include_router(bids_router)
