from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LogBase(BaseModel):
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    changes_json: Optional[str] = None

class LogCreate(LogBase):
    pass

class LogOut(LogBase):
    id: int
    user_id: int
    timestamp: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
