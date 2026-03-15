from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class SiteBase(BaseModel):
    site_id: str
    name: str
    address: Optional[str] = None
    lat: Optional[float] = None
    long: Optional[float] = None
    geofence_radius: Optional[float] = 100.0
    contact_person_name: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_email: Optional[str] = None
    site_type: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "Active"

class SiteCreate(SiteBase):
    pass

class SiteUpdate(BaseModel):
    site_id: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    long: Optional[float] = None
    geofence_radius: Optional[float] = None
    contact_person_name: Optional[str] = None
    contact_person_phone: Optional[str] = None
    contact_person_email: Optional[str] = None
    site_type: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class SiteOut(SiteBase):
    id: int

    class Config:
        from_attributes = True

class SiteAssignmentBase(BaseModel):
    site_id: int
    employee_id: int
    supervisor_id: Optional[int] = None
    assigned_date: date

class SiteAssignmentCreate(SiteAssignmentBase):
    pass

class SiteAssignmentOut(SiteAssignmentBase):
    id: int

    class Config:
        from_attributes = True

class SiteIssueBase(BaseModel):
    site_id: int
    reported_by: int
    description: str
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Open"
    resolution_notes: Optional[str] = None
    created_date: datetime
    resolved_date: Optional[datetime] = None

class SiteIssueCreate(SiteIssueBase):
    pass

class SiteIssueOut(SiteIssueBase):
    id: int

    class Config:
        from_attributes = True
