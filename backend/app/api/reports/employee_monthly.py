from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter()

@router.get("/employee/{employee_id}/monthly")
def get_employee_monthly_report(employee_id: int, month: str, db: Session = Depends(get_db)):
    """
    Returns a monthly report for a specific employee.
    `month` param format: YYYY-MM (e.g. 2026-04)
    Returns:
      - dayWise: array of daily records (date, checkIn, checkOut, OT, status, sites visited, tasks done, timeline events count)
      - overall: summary stats (presentDays, absentDays, totalOTHours, totalSitesVisited, totalTasksCompleted, sitesMapData)
    """
    from app.models.employee import Employee
    from app.models.department import Department
    from app.models.attendance import Attendance, SiteAttendance, LocationTracking
    from app.models.task import Task, TaskProgress
    from app.models.site import Site, SiteAssignment
    from sqlalchemy import func
    import datetime as _dt
    import calendar

    # Parse month
    try:
        year, mon = month.split("-")
        year, mon = int(year), int(mon)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")

    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    dept = db.query(Department).filter(Department.id == emp.department_id).first()

    # Date range for the month
    first_day = _dt.date(year, mon, 1)
    last_day_num = calendar.monthrange(year, mon)[1]
    last_day = _dt.date(year, mon, last_day_num)

    # Fetch all attendance records for this employee in the month
    attendances = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == employee_id,
            func.date(Attendance.check_in) >= first_day,
            func.date(Attendance.check_in) <= last_day
        )
        .order_by(Attendance.check_in)
        .all()
    )

    # Build a map: date -> attendance record
    att_by_date = {}
    for att in attendances:
        if att.check_in:
            d = att.check_in.date()
            att_by_date[d] = att

    # Fetch all site attendances for this employee in the month
    att_ids = [a.id for a in attendances]
    site_attendances = []
    if att_ids:
        site_attendances = db.query(SiteAttendance).filter(SiteAttendance.attendance_id.in_(att_ids)).all()

    # Group site attendances by attendance_id
    sa_by_att = {}
    for sa in site_attendances:
        sa_by_att.setdefault(sa.attendance_id, []).append(sa)

    # Fetch all task progress in the month
    task_progress_list = (
        db.query(TaskProgress)
        .filter(
            TaskProgress.updated_by == employee_id,
            func.date(TaskProgress.updated_date) >= first_day,
            func.date(TaskProgress.updated_date) <= last_day
        )
        .all()
    )

    # Group task progress by date
    tp_by_date = {}
    for tp in task_progress_list:
        d = tp.updated_date.date()
        tp_by_date.setdefault(d, []).append(tp)

    # Build day-wise data
    day_wise = []
    total_present = 0
    total_absent = 0
    total_ot_minutes = 0
    all_sites_visited = {}  # site_id -> site info with lat/long
    total_tasks_completed = 0

    # Determine how many days to iterate (up to today if current month)
    today = _dt.datetime.now().date()
    end_iter = min(last_day, today)

    for day_offset in range(0, (end_iter - first_day).days + 1):
        current_date = first_day + _dt.timedelta(days=day_offset)

        att = att_by_date.get(current_date)

        day_record = {
            "date": current_date.isoformat(),
            "dayName": current_date.strftime("%A"),
            "dayShort": current_date.strftime("%a"),
            "dayNum": current_date.day,
            "status": "Absent",
            "checkIn": None,
            "checkOut": None,
            "otMinutes": 0,
            "otFormatted": "0h",
            "sitesVisited": 0,
            "sitesList": [],
            "tasksCompleted": 0,
            "tasksList": [],
            "timelineCount": 0,
        }

        if att:
            total_present += 1
            day_record["status"] = att.status or "Present"
            day_record["checkIn"] = att.check_in.strftime("%H:%M") if att.check_in else None
            day_record["checkOut"] = att.check_out.strftime("%H:%M") if att.check_out else None

            # Calculate OT (simple: hours beyond 8h shift)
            if att.check_in and att.check_out:
                worked = (att.check_out - att.check_in).total_seconds() / 3600.0
                worked = min(worked, 24.0)  # Cap at 24h to handle data anomalies
                ot_hours = max(0, worked - 8.0)
                ot_minutes = int(ot_hours * 60)
                day_record["otMinutes"] = ot_minutes
                total_ot_minutes += ot_minutes
                if ot_hours >= 1:
                    day_record["otFormatted"] = f"{int(ot_hours)}h {int(ot_minutes % 60)}m" if ot_minutes % 60 else f"{int(ot_hours)}h"
                elif ot_minutes > 0:
                    day_record["otFormatted"] = f"{ot_minutes}m"

            # Sites visited this day
            day_sites = sa_by_att.get(att.id, [])
            day_record["sitesVisited"] = len(day_sites)
            for sa in day_sites:
                site_info = {
                    "id": sa.site_id,
                    "name": sa.site.name if sa.site else "Unknown",
                    "checkIn": sa.check_in.strftime("%H:%M") if sa.check_in else None,
                    "checkOut": sa.check_out.strftime("%H:%M") if sa.check_out else None,
                    "status": sa.status,
                }
                day_record["sitesList"].append(site_info)
                # Collect for map
                if sa.site and sa.site_id not in all_sites_visited:
                    all_sites_visited[sa.site_id] = {
                        "id": sa.site_id,
                        "name": sa.site.name,
                        "lat": sa.site.lat,
                        "long": sa.site.long,
                        "address": sa.site.address,
                        "visitCount": 0,
                    }
                if sa.site_id in all_sites_visited:
                    all_sites_visited[sa.site_id]["visitCount"] += 1

            # Timeline events count for this day
            timeline_count = 1  # check-in
            timeline_count += len(day_sites) * 2  # site-in + site-out
            if att.check_out:
                timeline_count += 1
            day_record["timelineCount"] = timeline_count

        else:
            total_absent += 1

        # Tasks completed this day
        day_tasks = tp_by_date.get(current_date, [])
        day_record["tasksCompleted"] = len(day_tasks)
        total_tasks_completed += len(day_tasks)
        for tp in day_tasks:
            day_record["tasksList"].append({
                "id": tp.task.id if tp.task else None,
                "title": tp.task.title if tp.task else "Unknown Task",
                "progress": tp.progress,
                "time": tp.updated_date.strftime("%H:%M"),
            })

        day_wise.append(day_record)

    # Overall summary
    total_ot_hours = total_ot_minutes / 60.0
    ot_display = f"{int(total_ot_hours)}h {int(total_ot_minutes % 60)}m" if total_ot_minutes % 60 else f"{int(total_ot_hours)}h"

    return {
        "employeeName": emp.name,
        "employeeCode": f"EMP-{emp.id:04d}",
        "department": dept.name if dept else "General",
        "month": month,
        "monthLabel": first_day.strftime("%B %Y"),
        "dayWise": day_wise,
        "overall": {
            "presentDays": total_present,
            "absentDays": total_absent,
            "totalWorkingDays": total_present + total_absent,
            "attendanceRate": f"{round(total_present / max(1, total_present + total_absent) * 100)}%",
            "totalOTMinutes": total_ot_minutes,
            "totalOTFormatted": ot_display,
            "totalSitesVisited": len(all_sites_visited),
            "totalTasksCompleted": total_tasks_completed,
            "sitesMapData": list(all_sites_visited.values()),
        }
    }
