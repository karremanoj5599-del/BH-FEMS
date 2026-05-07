from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.core.security import get_current_user, RoleChecker
from app.core.audit import log_activity
from app.models import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeListResponse
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("/list/minimal", response_model=List[EmployeeResponse])
def list_employees_minimal(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    employees = EmployeeService.get_minimal_list(db)
    return [EmployeeResponse.model_validate(emp) for emp in employees]

@router.get("/", response_model=EmployeeListResponse)
def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    status_filter: str = Query(None, alias="status"),
    department_id: int = Query(None),
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["Admin", "HR", "Manager", "Supervisor"]))
):
    items, total, total_pages = EmployeeService.get_employees(db, page, page_size, search, status_filter, department_id)
    
    formatted_items = []
    for emp in items:
        formatted_items.append(EmployeeResponse(
            id=emp.id,
            employee_id=emp.employee_id,
            name=emp.name,
            email=emp.email,
            phone=emp.phone,
            profile_photo_url=emp.profile_photo_url,
            address=emp.address,
            designation=emp.designation,
            joining_date=emp.joining_date,
            emergency_contact_phone=emp.emergency_contact_phone,
            status=emp.status,
            type=emp.type,
            department_id=emp.department_id,
            team_id=emp.team_id,
            supervisor_id=emp.supervisor_id,
            role_id=emp.role_id,
            role_name=emp.role.name if emp.role else None,
            department_name=emp.department.name if emp.department else None,
            team_name=emp.team.name if emp.team else None,
        ))

    return EmployeeListResponse(
        items=formatted_items, total=total, page=page, page_size=page_size, total_pages=total_pages
    )

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    _=Depends(RoleChecker(["Admin", "HR"]))
):
    emp = EmployeeService.create_employee(db, data)
    log_activity(db, current_user.id, "CREATE", "Employee", emp.id, {"name": emp.name, "email": emp.email, "employee_id": emp.employee_id})
    return EmployeeResponse.model_validate(emp)

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    emp = EmployeeService.get_employee(db, employee_id)
    return EmployeeResponse.model_validate(emp)

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    _=Depends(RoleChecker(["Admin", "HR"]))
):
    emp = EmployeeService.update_employee(db, employee_id, data)
    safe_update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if k != "password"}
    log_activity(db, current_user.id, "UPDATE", "Employee", emp.id, safe_update_data)
    return EmployeeResponse.model_validate(emp)

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    _=Depends(RoleChecker(["Admin"]))
):
    emp = EmployeeService.get_employee(db, employee_id)
    EmployeeService.delete_employee(db, employee_id)
    log_activity(db, current_user.id, "DELETE", "Employee", employee_id, {"name": emp.name, "employee_id": emp.employee_id})
