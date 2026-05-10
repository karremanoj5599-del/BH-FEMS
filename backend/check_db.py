import sys
import os
sys.path.append(os.getcwd())
from backend.app.core.database import SessionLocal
from backend.app.models.site import Site

db = SessionLocal()
try:
    count = db.query(Site).count()
    print(f"Total sites in database: {count}")
    
    if count > 0:
        sites = db.query(Site).limit(5).all()
        for s in sites:
            print(f"Site: {s.name}, Lat: {s.lat}, Long: {s.long}")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
