from app.core.database import Base

# Import all models here to register them with Base.metadata
from app.models.role import Role
from app.models.department import Department
from app.models.team import Team
from app.models.employee import Employee, Skill, EmployeeSkill
from app.models.site import Site, SiteAssignment, SiteIssue
from app.models.shift import ShiftType, Shift, ShiftSwapRequest, ShiftBid, ShiftPolicy
from app.models.task import Task, TaskProgress, MaterialUsage
from app.models.attendance import Attendance, LocationTracking, SiteAttendance, GeofenceEvent
from app.models.expense import Expense, ExpenseApproval
from app.models.leave import LeaveType, Leave, LeaveBalance
from app.models.holiday import Holiday
from app.models.notification import Notification, NotificationRecipient
from app.models.report import Report, ReportSchedule
from app.models.log import Log

__all__ = [
    "Base",
    "Role",
    "Department",
    "Team",
    "Employee",
    "Skill",
    "EmployeeSkill",
    "Site",
    "SiteAssignment",
    "SiteIssue",
    "ShiftType",
    "Shift",
    "ShiftSwapRequest",
    "ShiftBid",
    "Task",
    "TaskProgress",
    "MaterialUsage",
    "Attendance",
    "LocationTracking",
    "SiteAttendance",
    "GeofenceEvent",
    "Expense",
    "ExpenseApproval",
    "LeaveType",
    "Leave",
    "LeaveBalance",
    "Holiday",
    "Notification",
    "NotificationRecipient",
    "Report",
    "ReportSchedule",
    "Log",
]
