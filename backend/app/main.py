"""
FEMS - Field Employee Management System
Main FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base

# Import all models to register them with SQLAlchemy
from app.models import role, department, team, employee, shift, site, task, expense, leave, holiday, attendance, report, notification, log  # noqa: F401

# Import API routers
from app.api import auth, roles, employees, departments, teams, dashboard, attendance, sites, shifts, tasks, expenses, leaves, holidays, reports, logs


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API Routers
    app.include_router(auth.router, prefix=settings.API_PREFIX)
    app.include_router(roles.router, prefix=settings.API_PREFIX)
    app.include_router(employees.router, prefix=settings.API_PREFIX)
    app.include_router(departments.router, prefix=settings.API_PREFIX)
    app.include_router(teams.router, prefix=settings.API_PREFIX)
    app.include_router(dashboard.router, prefix=settings.API_PREFIX)
    app.include_router(attendance.router, prefix=settings.API_PREFIX)
    app.include_router(sites.router, prefix=settings.API_PREFIX)
    app.include_router(shifts.router, prefix=settings.API_PREFIX)
    app.include_router(tasks.router, prefix=settings.API_PREFIX)
    app.include_router(expenses.router, prefix=settings.API_PREFIX)
    app.include_router(leaves.router, prefix=settings.API_PREFIX)
    app.include_router(holidays.router, prefix=settings.API_PREFIX)
    app.include_router(reports.router, prefix=settings.API_PREFIX)
    app.include_router(logs.router, prefix=settings.API_PREFIX)

    @app.on_event("startup")
    def startup():
        # Create all tables
        Base.metadata.create_all(bind=engine)

    @app.get("/")
    def root():
        return {
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
        }

    @app.get("/health")
    def health_check():
        return {"status": "healthy"}

    return app


app = create_app()
