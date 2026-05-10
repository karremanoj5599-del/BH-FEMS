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
    site_id: Optional[int] = None
    task_id: Optional[int] = None
    start_time: Optional[datetime] = None
    reached_at: Optional[datetime] = None
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
    execution_timeline: Optional[str] = None

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
    check_out_lat: Optional[float] = None
    check_out_long: Optional[float] = None
    status: Optional[str] = "Present"
    device_id: Optional[str] = None
    mode: Optional[str] = "GPS"
    face_recognition_verified: Optional[bool] = False
    selfie_url: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    employee_id: Optional[int] = None

class AttendanceCheckOut(BaseModel):
    lat: float
    long: float

class AttendanceOut(AttendanceBase):
    id: int
    employee_id: int
    location_tracks: List[LocationTrackingOut] = []
    site_attendances: List[SiteAttendanceOut] = []

    class Config:
        from_attributes = True

class AttendanceLive(AttendanceOut):
    employee_name: str
    department: Optional[str] = None
    latest_lat: Optional[float] = None
    latest_long: Optional[float] = None
class SiteComplete(BaseModel):
    notes: str
    photos: Optional[str] = None
