from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import HTTPException
from sqlalchemy import func

from app.models import Site, SiteAssignment, SiteIssue, SiteAttendance, Task
from app.schemas.site import SiteCreate, SiteUpdate, SiteIssueCreate

class SiteService:
    @staticmethod
    def create_site(db: Session, site_in: SiteCreate):
        db_site = Site(**site_in.model_dump())
        db.add(db_site)
        db.commit()
        db.refresh(db_site)
        return db_site

    @staticmethod
    def get_sites(
        db: Session,
        skip: int = 0, 
        limit: int = 100, 
        status: Optional[str] = None,
        site_type: Optional[str] = None,
        search: Optional[str] = None
    ):
        query = db.query(Site)
        if status and status != "all":
            query = query.filter(Site.status == status)
        if site_type and site_type != "all":
            query = query.filter(Site.site_type == site_type)
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                (Site.name.ilike(search_filter)) |
                (Site.site_id.ilike(search_filter)) |
                (Site.address.ilike(search_filter)) |
                (Site.contact_person_name.ilike(search_filter))
            )
        sites = query.offset(skip).limit(limit).all()
        
        # Add execution status and task counts
        today_start = datetime.combine(date.today(), datetime.min.time())
        tomorrow_start = today_start + timedelta(days=1)
        for site in sites:
            latest_att = db.query(SiteAttendance).filter(
                SiteAttendance.site_id == site.id,
                SiteAttendance.start_time >= today_start,
                SiteAttendance.start_time < tomorrow_start
            ).order_by(SiteAttendance.start_time.desc()).first()
            site.execution_status = latest_att.status if latest_att else "No Activity"
            site.task_count = db.query(Task).filter(Task.site_id == site.id).count()
        return sites

    @staticmethod
    def get_my_sites(db: Session, current_user_id: int):
        assigned_site_ids = db.query(SiteAssignment.site_id).filter(SiteAssignment.employee_id == current_user_id).all()
        site_ids = [row[0] for row in assigned_site_ids]
        if not site_ids: return []
        sites = db.query(Site).filter(Site.id.in_(site_ids)).all()
        
        today_start = datetime.combine(date.today(), datetime.min.time())
        tomorrow_start = today_start + timedelta(days=1)
        for site in sites:
            latest_att = db.query(SiteAttendance).filter(
                SiteAttendance.site_id == site.id,
                SiteAttendance.start_time >= today_start,
                SiteAttendance.start_time < tomorrow_start
            ).order_by(SiteAttendance.start_time.desc()).first()
            site.execution_status = latest_att.status if latest_att else "No Activity"
            site.task_count = db.query(Task).filter(
                Task.site_id == site.id,
                Task.assigned_employee == current_user_id,
                Task.status != "done"
            ).count()
        return sites

    @staticmethod
    def get_site(db: Session, site_id: int):
        db_site = db.query(Site).filter(Site.id == site_id).first()
        if not db_site:
            raise HTTPException(status_code=404, detail="Site not found")
        return db_site

    @staticmethod
    def update_site(db: Session, site_id: int, site_in: SiteUpdate):
        db_site = db.query(Site).filter(Site.id == site_id).first()
        if not db_site:
            raise HTTPException(status_code=404, detail="Site not found")
        
        update_data = site_in.model_dump(exclude_unset=True)
        # Handle assignments if in update_data
        if "assigned_employee_ids" in update_data:
            new_emp_ids = set(update_data.pop("assigned_employee_ids"))
            current_assignments = db.query(SiteAssignment).filter(SiteAssignment.site_id == site_id).all()
            current_emp_ids = {a.employee_id for a in current_assignments}
            # Remove
            for a in current_assignments:
                if a.employee_id not in new_emp_ids: db.delete(a)
            # Add
            for emp_id in new_emp_ids:
                if emp_id not in current_emp_ids:
                    db.add(SiteAssignment(site_id=site_id, employee_id=emp_id, assigned_date=date.today()))

        for key, value in update_data.items():
            setattr(db_site, key, value)
        
        db.commit()
        db.refresh(db_site)
        return db_site

    @staticmethod
    def delete_site(db: Session, site_id: int):
        db_site = db.query(Site).filter(Site.id == site_id).first()
        if not db_site:
            raise HTTPException(status_code=404, detail="Site not found")
            
        from app.models import Expense
        db.query(Expense).filter(Expense.linked_site_id == site_id).update({"linked_site_id": None})
        
        db.delete(db_site)
        db.commit()
        return True

    @staticmethod
    def create_site_issue(db: Session, issue_in: SiteIssueCreate):
        db_issue = SiteIssue(**issue_in.model_dump(), created_date=datetime.utcnow())
        db.add(db_issue)
        db.commit()
        db.refresh(db_issue)
        return db_issue
