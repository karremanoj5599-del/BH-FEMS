"""
Tasks API Sub-package
Combines all task-related routers into a single router for main.py
"""
from fastapi import APIRouter

from app.api.tasks.crud import router as crud_router
from app.api.tasks.progress import router as progress_router
from app.api.tasks.materials import router as materials_router
from app.api.tasks.execution import router as execution_router

router = APIRouter(prefix="/tasks", tags=["Tasks"])

router.include_router(crud_router)
router.include_router(progress_router)
router.include_router(materials_router)
router.include_router(execution_router)
