from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportBase(BaseModel):
    type: str # Daily / Monthly / Custom
    file_url: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportOut(ReportBase):
    id: int
    generated_at: datetime

    class Config:
        from_attributes = True

class ReportScheduleBase(BaseModel):
    report_type: str
    frequency: str
    recipient_id: int

class ReportScheduleCreate(ReportScheduleBase):
    pass

class ReportScheduleOut(ReportScheduleBase):
    id: int

    class Config:
        from_attributes = True
