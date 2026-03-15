from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LocationTrackingBase(BaseModel):
    lat: float
    long: float
    timestamp: datetime
    battery: Optional[str] = None
    network: Optional[str] = None

class LocationTrackingCreate(LocationTrackingBase):
    pass

class LocationTrackingOut(LocationTrackingBase):
    id: int
    attendance_id: int

    class Config:
        from_attributes = True

class SiteAttendanceBase(BaseModel):
    site_id: int
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    progress: Optional[str] = None
    notes: Optional[str] = None
    photos: Optional[str] = None
    signature_url: Optional[str] = None
    status: Optional[str] = "Not Started"
    total_distance_traveled: Optional[float] = 0

class SiteAttendanceCreate(SiteAttendanceBase):
    pass

class SiteAttendanceOut(SiteAttendanceBase):
    id: int
    attendance_id: int

    class Config:
        from_attributes = True

class GeofenceEventBase(BaseModel):
    site_id: int
    event: str
    timestamp: datetime

class GeofenceEventCreate(GeofenceEventBase):
    pass

class GeofenceEventOut(GeofenceEventBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    lat: Optional[float] = None
    long: Optional[float] = None
    status: Optional[str] = "Present"
    device_id: Optional[str] = None
    mode: Optional[str] = "GPS"
    face_recognition_verified: Optional[bool] = False
    selfie_url: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    employee_id: int

class AttendanceOut(AttendanceBase):
    id: int
    employee_id: int
    location_tracks: List[LocationTrackingOut] = []
    site_attendances: List[SiteAttendanceOut] = []

    class Config:
        from_attributes = True
