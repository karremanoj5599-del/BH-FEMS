from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter()

@router.get("/employee/{employee_id}/daily")
def get_employee_daily_report(employee_id: int, date: str, db: Session = Depends(get_db)):
    """
    Returns a detailed daily report for a specific employee on a specific date.
    Returns: employee details, check-in/out info, sites visited, tasks visited, and chronological timeline.
    """
    from app.models.employee import Employee
    from app.models.department import Department
    from app.models.attendance import Attendance, LocationTracking, SiteAttendance
    from app.models.task import Task, TaskProgress
    import datetime

    target_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()

    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    dept = db.query(Department).filter(Department.id == emp.department_id).first()
    
    # Get attendance for that day
    from sqlalchemy import func
    att = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        func.date(Attendance.check_in) == target_date
    ).first()

    report = {
        "employeeName": emp.name,
        "employeeCode": f"EMP-{emp.id:04d}",
        "department": dept.name if dept else "General",
        "status": att.status if att else "Absent",
        "checkInTime": att.check_in.strftime("%H:%M:%S") if att and att.check_in else None,
        "checkInPhoto": att.selfie_url if att else None,
        "checkInLocation": {"lat": att.lat, "long": att.long} if att and att.lat else None,
        "checkOutTime": att.check_out.strftime("%H:%M:%S") if att and att.check_out else None,
        "checkOutPhoto": att.check_out_photo_url if att else None,
        "checkOutLocation": {"lat": att.check_out_lat, "long": att.check_out_long} if att and att.check_out_lat else None,
        "ot": "0h", # Mock for now
        "timeline": [],
        "sitesVisited": [],
        "tasksVisited": []
    }

    if not att:
        return report

    # Fetch Sites Visited
    site_attendances = db.query(SiteAttendance).filter(SiteAttendance.attendance_id == att.id).all()
    for sa in site_attendances:
        report["sitesVisited"].append({
            "id": sa.id,
            "siteName": sa.site.name if sa.site else "Unknown Site",
            "checkIn": sa.check_in.strftime("%H:%M") if sa.check_in else None,
            "checkOut": sa.check_out.strftime("%H:%M") if sa.check_out else None,
            "status": sa.status,
            "lat": sa.site.lat if sa.site else None,
            "long": sa.site.long if sa.site else None
        })

    # Fetch Tasks updated by this employee on this date
    task_progress = db.query(TaskProgress).filter(
        TaskProgress.updated_by == employee_id,
        func.date(TaskProgress.updated_date) == target_date
    ).all()
    
    for tp in task_progress:
        report["tasksVisited"].append({
            "id": tp.task.id,
            "taskTitle": tp.task.title,
            "progress": tp.progress,
            "updatedTime": tp.updated_date.strftime("%H:%M:%S")
        })

    # Build Timeline
    timeline = []
    
    if att.check_in:
        timeline.append({
            "time": att.check_in,
            "title": "Checked In",
            "description": "Started the day",
            "type": "check-in",
            "lat": att.lat,
            "long": att.long
        })
        
    for sa in site_attendances:
        if sa.check_in:
            timeline.append({
                "time": sa.check_in,
                "title": f"Arrived at {sa.site.name if sa.site else 'Site'}",
                "description": f"Checked in to site",
                "type": "site-in",
                "lat": sa.site.lat if sa.site else None,
                "long": sa.site.long if sa.site else None
            })
        if sa.check_out:
            timeline.append({
                "time": sa.check_out,
                "title": f"Left {sa.site.name if sa.site else 'Site'}",
                "description": f"Checked out from site",
                "type": "site-out",
                "lat": sa.site.lat if sa.site else None,
                "long": sa.site.long if sa.site else None
            })
            
    for tp in task_progress:
        timeline.append({
            "time": tp.updated_date,
            "title": f"Updated Task: {tp.task.title}",
            "description": f"Progress: {tp.progress}",
            "type": "task-update",
            "lat": None,
            "long": None
        })
        
    # Location Tracking (every N hours/mins)
    locations = db.query(LocationTracking).filter(LocationTracking.attendance_id == att.id).all()
    for loc in locations:
        timeline.append({
            "time": loc.timestamp,
            "title": "Location Update",
            "description": f"Lat: {loc.lat:.4f}, Long: {loc.long:.4f}",
            "type": "location",
            "lat": loc.lat,
            "long": loc.long
        })
        
    if att.check_out:
        timeline.append({
            "time": att.check_out,
            "title": "Checked Out",
            "description": "Ended the day",
            "type": "check-out",
            "lat": att.check_out_lat,
            "long": att.check_out_long
        })

    # Sort timeline by time
    timeline.sort(key=lambda x: x["time"])
    
    # Format times for JSON response
    for item in timeline:
        item["time"] = item["time"].strftime("%H:%M:%S")

    report["timeline"] = timeline

    return report
