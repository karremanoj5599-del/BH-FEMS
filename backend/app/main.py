"""
FEMS - Field Employee Management System
Main FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
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
    # Base allowed origins
    origins = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    
    # Add settings origins and variations
    if settings.CORS_ORIGINS:
        for o in settings.CORS_ORIGINS:
            o_clean = o.strip().rstrip("/")
            if o_clean and o_clean not in origins:
                origins.append(o_clean)
                # Also add the version without 'https://' if it's there for extra safety
                # though CORSMiddleware expects the full protocol.

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

    from fastapi.responses import JSONResponse
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        import traceback
        return JSONResponse(
            status_code=500,
            content={
                "error": str(exc),
                "detail": f"Backend Error: {str(exc)}",
                "traceback": traceback.format_exc()
            }
        )

    # Serve static files if they exist (for production Docker deployment)
    static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
    if os.path.isdir(static_dir):
        # Mount the assets folder explicitly
        assets_dir = os.path.join(static_dir, "assets")
        if os.path.isdir(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            # Do not intercept API or docs routes
            if full_path.startswith(settings.API_PREFIX.lstrip("/")) or full_path in ["docs", "redoc", "openapi.json"]:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="Not Found")
                
            index_file = os.path.join(static_dir, "index.html")
            requested_file = os.path.join(static_dir, full_path)
            
            # Serve requested file if it exists (e.g., /vite.svg, /favicon.ico)
            if os.path.isfile(requested_file):
                return FileResponse(requested_file)
            
            # Fallback to index.html for SPA routing
            return FileResponse(index_file)

    return app


app = create_app()
