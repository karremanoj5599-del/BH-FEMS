"""
FEMS - Attendance Models
Attendance, LocationTracking, SiteAttendance, GeofenceEvent
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    lat = Column(Float, nullable=True)
    long = Column(Float, nullable=True)
    check_out_lat = Column(Float, nullable=True)
    check_out_long = Column(Float, nullable=True)
    status = Column(String(20), default="Present")
    device_id = Column(String(100), nullable=True)
    mode = Column(String(20), default="GPS")
    face_recognition_verified = Column(Boolean, default=False)
    selfie_url = Column(Text, nullable=True)
    check_out_photo_url = Column(Text, nullable=True)

    employee = relationship("Employee", back_populates="attendance_records")
    location_tracks = relationship("LocationTracking", back_populates="attendance", cascade="all, delete-orphan")
    site_attendances = relationship("SiteAttendance", back_populates="attendance", cascade="all, delete-orphan")


class LocationTracking(Base):
    __tablename__ = "location_tracking"

    id = Column(Integer, primary_key=True, index=True)
    attendance_id = Column(Integer, ForeignKey("attendance.id"), nullable=False)
    lat = Column(Float, nullable=False)
    long = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    battery = Column(String(10), nullable=True)
    network = Column(String(20), nullable=True)

    attendance = relationship("Attendance", back_populates="location_tracks")


class SiteAttendance(Base):
    __tablename__ = "site_attendance"

    id = Column(Integer, primary_key=True, index=True)
    attendance_id = Column(Integer, ForeignKey("attendance.id"), nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    start_time = Column(DateTime, nullable=True)
    reached_at = Column(DateTime, nullable=True)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    progress = Column(String(10), nullable=True)
    notes = Column(Text, nullable=True)
    photos = Column(Text, nullable=True)
    signature_url = Column(String(500), nullable=True)
    status = Column(String(20), default="Not Started")
    total_distance_traveled = Column(Float, default=0)
    execution_timeline = Column(Text, nullable=True)  # JSON array of timeline events

    attendance = relationship("Attendance", back_populates="site_attendances")
    site = relationship("Site", back_populates="site_attendances")
    task = relationship("Task", back_populates="site_attendances")


class GeofenceEvent(Base):
    __tablename__ = "geofence_events"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    event = Column(String(30), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)

    employee = relationship("Employee", back_populates="geofence_events")
    site = relationship("Site", back_populates="geofence_events")
