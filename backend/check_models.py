
import sys
import os

# Add the backend directory to sys.path to allow imports from app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.core.config import settings
    print(f"Using DATABASE_URL: {settings.DATABASE_URL}")
    
    from app.core.database import Base, engine
    from app.models import role, department, team, employee, shift, site, task, expense, leave, holiday, attendance, report, notification, log
    from sqlalchemy import inspect
    
    # This triggers mapper initialization
    from sqlalchemy.orm import configure_mappers
    configure_mappers()
    print("SQLAlchemy mappers configured successfully!")

    # Try to create all tables
    print("Attempting to create tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
