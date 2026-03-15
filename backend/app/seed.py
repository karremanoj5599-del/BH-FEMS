"""
FEMS - Database Seeder
Creates default roles and an admin user for initial setup.
Run: python -m app.seed
"""
import sys
from pathlib import Path

# Add the project root to sys.path to allow absolute imports
root_path = Path(__file__).resolve().parent.parent
if str(root_path) not in sys.path:
    sys.path.append(str(root_path))

from app.models import Base, Role, Employee
from app.core.database import SessionLocal, engine
from app.core.security import hash_password

# Import all models to ensure they are registered with Base.metadata
from app.models import (
    department, team, employee, shift, site, task, attendance, 
    expense, leave, holiday, notification, report, log
)


def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ── Default Roles ─────────────────────────────────
        default_roles = [
            {"name": "Admin", "description": "Full system access", "permissions": '{"all": true}'},
            {"name": "HR", "description": "Human resources management", "permissions": '{"employees": true, "leaves": true, "departments": true, "reports": true}'},
            {"name": "Manager", "description": "Department/site management", "permissions": '{"employees": true, "sites": true, "tasks": true, "reports": true, "dashboard": true}'},
            {"name": "Supervisor", "description": "Team supervision and field oversight", "permissions": '{"employees": true, "sites": true, "tasks": true, "attendance": true}'},
            {"name": "Field Employee", "description": "Field worker access", "permissions": '{"attendance": true, "tasks": true, "expenses": true, "leaves": true}'},
        ]

        for role_data in default_roles:
            existing = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing:
                db.add(Role(**role_data))
                print(f"  [OK] Created role: {role_data['name']}")
        
        db.commit()

        # ── Admin User ────────────────────────────────────
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        admin_email = "admin@fems.com"

        if not db.query(Employee).filter(Employee.email == admin_email).first():
            admin = Employee(
                employee_id="ADMIN-001",
                name="System Administrator",
                email=admin_email,
                password_hash=hash_password("admin123"),
                designation="System Administrator",
                status="Active",
                type="Permanent",
                role_id=admin_role.id if admin_role else None,
            )
            db.add(admin)
            db.commit()
            print(f"  [OK] Created admin user: {admin_email} / admin123")

        print("\nDatabase seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
