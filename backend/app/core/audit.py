from sqlalchemy.orm import Session
from datetime import datetime, date
import json
from app.models import Log

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

def log_activity(
    db: Session, 
    user_id: int, 
    action: str, 
    entity_type: str, 
    entity_id: int = None, 
    changes: dict = None
):
    """
    Logs an activity to the audit logs table.
    
    Args:
        db: SQLAlchemy session
        user_id: ID of the employee performing the action
        action: The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
        entity_type: The type of entity affected (e.g., 'Employee', 'Site', 'Task')
        entity_id: The ID of the affected entity
        changes: A dictionary of changes, will be serialized to JSON
    """
    try:
        changes_json = json.dumps(changes, default=json_serial) if changes else None
        
        db_log = Log(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            timestamp=datetime.utcnow(),
            changes_json=changes_json
        )
        db.add(db_log)
        db.commit()
    except Exception as e:
        # We don't want audit logging failures to break the main application flow
        # In a production app, this should be logged to a real logger (e.g., file or monitoring service)
        print(f"Failed to log activity: {str(e)}")
        db.rollback()
