from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import RoleChecker
from app.models import Employee
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.services.org_service import OrgService

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=list[DepartmentResponse])
def list_departments(db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR", "Manager"]))):
    departments = OrgService.get_departments(db)
    result = []
    for dept in departments:
        emp_count = db.query(Employee).filter(Employee.department_id == dept.id).count()
        result.append(DepartmentResponse(
            id=dept.id, name=dept.name, description=dept.description,
            manager_id=dept.manager_id, status=dept.status,
            manager_name=dept.manager.name if dept.manager else None,
            employee_count=emp_count,
        ))
    return result

@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(data: DepartmentCreate, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR"]))):
    dept = OrgService.create_department(db, data)
    return DepartmentResponse(id=dept.id, name=dept.name, description=dept.description,
                               manager_id=dept.manager_id, status=dept.status)

@router.get("/{dept_id}", response_model=DepartmentResponse)
def get_department(dept_id: int, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR", "Manager"]))):
    dept = OrgService.get_department(db, dept_id)
    emp_count = db.query(Employee).filter(Employee.department_id == dept.id).count()
    return DepartmentResponse(
        id=dept.id, name=dept.name, description=dept.description,
        manager_id=dept.manager_id, status=dept.status,
        manager_name=dept.manager.name if dept.manager else None,
        employee_count=emp_count,
    )

@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(dept_id: int, data: DepartmentUpdate, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR"]))):
    dept = OrgService.update_department(db, dept_id, data)
    return DepartmentResponse(id=dept.id, name=dept.name, description=dept.description,
                               manager_id=dept.manager_id, status=dept.status)

@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(dept_id: int, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin"]))):
    OrgService.delete_department(db, dept_id)
    return None
