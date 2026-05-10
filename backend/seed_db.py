
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.role import Role
from app.models.employee import Employee
from app.core.security import hash_password
from app.core.config import settings

def seed():
    print(f"Connecting to database: {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create tables
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)

        # 2. Create Super Admin Role
        admin_role = db.query(Role).filter(Role.name == "Super Admin").first()
        if not admin_role:
            print("Creating Super Admin role...")
            admin_role = Role(
                name="Super Admin",
                permissions='{"all": true}'
            )
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)

        # 3. Create Demo Admin User
        demo_email = "admin@fems.com"
        demo_user = db.query(Employee).filter(Employee.email == demo_email).first()
        if not demo_user:
            print(f"Creating demo user: {demo_email}")
            demo_user = Employee(
                employee_id="ADM001",
                name="Demo Administrator",
                email=demo_email,
                password_hash=hash_password("admin123"),
                role_id=admin_role.id,
                designation="System Admin",
                status="Active"
            )
            db.add(demo_user)

        # 4. Create your Google Login User
        my_email = "karremanoj559@gmail.com"
        my_user = db.query(Employee).filter(Employee.email == my_email).first()
        if not my_user:
            print(f"Registering your email for Google Login: {my_email}")
            my_user = Employee(
                employee_id="ADM002",
                name="Manoj Karre",
                email=my_email,
                password_hash=hash_password("google-auth-only"),
                role_id=admin_role.id,
                designation="Super Admin",
                status="Active"
            )
            db.add(my_user)

        db.commit()
        print("Database successfully seeded!")
        print(f"--- Login Details ---")
        print(f"Email: {demo_email}")
        print(f"Password: admin123")
        print(f"Google Login also enabled for: {my_email}")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure we can import from app
    sys.path.append(os.getcwd())
    seed()
