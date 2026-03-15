from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models import Site, SiteAssignment, SiteIssue
from app.schemas.site import (
    SiteCreate, SiteUpdate, SiteOut,
    SiteAssignmentCreate, SiteAssignmentOut,
    SiteIssueCreate, SiteIssueOut
)

router = APIRouter(prefix="/sites", tags=["Sites"])

@router.post("/", response_model=SiteOut)
def create_site(site_in: SiteCreate, db: Session = Depends(get_db)):
    db_site = Site(**site_in.model_dump())
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site

@router.get("/", response_model=List[SiteOut])
def get_sites(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sites = db.query(Site).offset(skip).limit(limit).all()
    return sites

@router.get("/{site_id}", response_model=SiteOut)
def get_site(site_id: int, db: Session = Depends(get_db)):
    db_site = db.query(Site).filter(Site.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    return db_site

@router.put("/{site_id}", response_model=SiteOut)
def update_site(site_id: int, site_in: SiteUpdate, db: Session = Depends(get_db)):
    db_site = db.query(Site).filter(Site.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    
    update_data = site_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_site, key, value)
    
    db.commit()
    db.refresh(db_site)
    return db_site

@router.delete("/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site(site_id: int, db: Session = Depends(get_db)):
    db_site = db.query(Site).filter(Site.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
    db.delete(db_site)
    db.commit()
    return None

@router.post("/issues", response_model=SiteIssueOut)
def create_site_issue(issue_in: SiteIssueCreate, db: Session = Depends(get_db)):
    db_issue = SiteIssue(**issue_in.model_dump(), created_date=datetime.utcnow())
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue
