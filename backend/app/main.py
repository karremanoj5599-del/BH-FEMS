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
from app.api import auth, roles, employees, departments, teams, dashboard, sites, expenses, leaves, holidays, logs
from app.api.attendance import router as attendance_router_pkg
from app.api.shifts import router as shifts_router_pkg
from app.api.tasks import router as tasks_router_pkg
from app.api.reports import router as reports_router_pkg


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    # Use explicit origins for security, but ensure common local variations are covered
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5180",
        "http://127.0.0.1:5180",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # Add settings origins if they exist
    if settings.CORS_ORIGINS:
        for o in settings.CORS_ORIGINS:
            if o not in origins:
                origins.append(o)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )


    # Register API Routers
    app.include_router(auth.router, prefix=settings.API_PREFIX)
    app.include_router(roles.router, prefix=settings.API_PREFIX)
    app.include_router(employees.router, prefix=settings.API_PREFIX)
    app.include_router(departments.router, prefix=settings.API_PREFIX)
    app.include_router(teams.router, prefix=settings.API_PREFIX)
    app.include_router(dashboard.router, prefix=settings.API_PREFIX)
    app.include_router(attendance_router_pkg, prefix=settings.API_PREFIX)
    app.include_router(sites.router, prefix=settings.API_PREFIX)
    app.include_router(shifts_router_pkg, prefix=settings.API_PREFIX)
    app.include_router(tasks_router_pkg, prefix=settings.API_PREFIX)
    app.include_router(expenses.router, prefix=settings.API_PREFIX)
    app.include_router(leaves.router, prefix=settings.API_PREFIX)
    app.include_router(holidays.router, prefix=settings.API_PREFIX)
    app.include_router(reports_router_pkg, prefix=settings.API_PREFIX)
    app.include_router(logs.router, prefix=settings.API_PREFIX)

    @app.on_event("startup")
    def startup():
        # In production/serverless, we rely on migrations (Alembic) 
        # to handle schema updates, rather than create_all on every cold start.
        if settings.DEBUG:
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
