from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.audit import log_activity
from app.models import Employee
from app.schemas.site import (
    SiteCreate, SiteUpdate, SiteOut,
    SiteIssueCreate, SiteIssueOut
)
from app.services.site_service import SiteService

router = APIRouter(prefix="/sites", tags=["Sites"])

@router.post("", response_model=SiteOut)
def create_site(
    site_in: SiteCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_site = SiteService.create_site(db, site_in)
    log_activity(db, current_user.id, "CREATE", "Site", db_site.id, {"name": db_site.name})
    return db_site

@router.get("", response_model=List[SiteOut])
def get_sites(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    site_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return SiteService.get_sites(db, skip, limit, status, site_type, search)

@router.get("/my-sites", response_model=List[SiteOut])
def get_my_sites(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    return SiteService.get_my_sites(db, current_user.id)

@router.get("/{site_id}", response_model=SiteOut)
def get_site(site_id: int, db: Session = Depends(get_db)):
    return SiteService.get_site(db, site_id)

@router.put("/{site_id}", response_model=SiteOut)
def update_site(
    site_id: int,
    site_in: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_site = SiteService.update_site(db, site_id, site_in)
    log_activity(db, current_user.id, "UPDATE", "Site", db_site.id, site_in.model_dump(exclude_unset=True))
    return db_site

@router.patch("/{site_id}", response_model=SiteOut)
def patch_site(
    site_id: int,
    site_in: SiteUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_site = SiteService.update_site(db, site_id, site_in)
    log_activity(db, current_user.id, "UPDATE", "Site", db_site.id, site_in.model_dump(exclude_unset=True))
    return db_site

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(
    site_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_site = SiteService.get_site(db, site_id)
    name = db_site.name
    SiteService.delete_site(db, site_id)
    log_activity(db, current_user.id, "DELETE", "Site", site_id, {"name": name})
    return None

@router.post("/issues", response_model=SiteIssueOut)
def create_site_issue(issue_in: SiteIssueCreate, db: Session = Depends(get_db)):
    return SiteService.create_site_issue(db, issue_in)
