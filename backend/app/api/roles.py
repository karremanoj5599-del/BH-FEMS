from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import RoleChecker
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
from app.services.org_service import OrgService

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.get("/", response_model=list[RoleResponse])
def list_roles(db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin"]))):
    return OrgService.get_roles(db)

@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(role_data: RoleCreate, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin"]))):
    return OrgService.create_role(db, role_data)

@router.put("/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, role_data: RoleUpdate, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin"]))):
    return OrgService.update_role(db, role_id, role_data)

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin"]))):
    OrgService.delete_role(db, role_id)
    return None
