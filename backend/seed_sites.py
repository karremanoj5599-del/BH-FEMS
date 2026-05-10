import sys
import os
sys.path.append(os.getcwd())
from backend.app.core.database import SessionLocal
from backend.app.models.site import Site

def seed_sites():
    db = SessionLocal()
    try:
        # Check if sites already exist
        if db.query(Site).count() > 0:
            print("Sites already exist. Skipping.")
            return

        print("Seeding sample sites with GPS coordinates...")
        sample_sites = [
            Site(
                site_id="SITE-001",
                name="Global Tech Park",
                address="Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103",
                lat=12.9279,
                long=77.6801,
                geofence_radius=200.0,
                status="Active",
                site_type="Office"
            ),
            Site(
                site_id="SITE-002",
                name="Brigade Metropolis",
                address="Garudachar Palya, Mahadevapura, Bengaluru, Karnataka 560048",
                lat=12.9934,
                long=77.7029,
                geofence_radius=150.0,
                status="Active",
                site_type="Office"
            ),
            Site(
                site_id="SITE-003",
                name="RMZ Ecoworld",
                address="Sarjapur - Marathahalli Outer Ring Rd, Bellandur, Bengaluru, Karnataka 560103",
                lat=12.9231,
                long=77.6744,
                geofence_radius=300.0,
                status="Active",
                site_type="Office"
            )
        ]
        db.add_all(sample_sites)
        db.commit()
        print(f"Successfully seeded {len(sample_sites)} sites.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_sites()
