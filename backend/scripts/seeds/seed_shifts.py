from app.models import ShiftType
from app.core.database import SessionLocal
from datetime import time

def seed_shift_types():
    db = SessionLocal()
    try:
        types = [
            {"name": "Morning Shift", "start_time": time(6, 0), "end_time": time(14, 0), "grace_period": 15, "break_rules": "45m", "ot_policy": "Approved Only"},
            {"name": "General Shift", "start_time": time(9, 0), "end_time": time(18, 0), "grace_period": 30, "break_rules": "60m", "ot_policy": "Double on Holidays"},
            {"name": "Night Shift", "start_time": time(22, 0), "end_time": time(6, 0), "grace_period": 15, "break_rules": "30m", "ot_policy": "Auto-Approved"},
        ]
        
        for t in types:
            existing = db.query(ShiftType).filter(ShiftType.name == t["name"]).first()
            if not existing:
                db.add(ShiftType(**t))
        
        db.commit()
        print("Shift types seeded successfully!")
    except Exception as e:
        print(f"Error seeding shift types: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_shift_types()
