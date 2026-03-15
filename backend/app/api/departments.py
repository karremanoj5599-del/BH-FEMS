from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import RoleChecker
from app.models import Department, Employee
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=list[DepartmentResponse])
def list_departments(db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR", "Manager"]))):
    departments = db.query(Department).all()
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
    if db.query(Department).filter(Department.name == data.name).first():
        raise HTTPException(status_code=400, detail="Department already exists")
    dept = Department(**data.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return DepartmentResponse(id=dept.id, name=dept.name, description=dept.description,
                               manager_id=dept.manager_id, status=dept.status)

@router.get("/{dept_id}", response_model=DepartmentResponse)
def get_department(dept_id: int, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR", "Manager"]))):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    emp_count = db.query(Employee).filter(Employee.department_id == dept.id).count()
    return DepartmentResponse(
        id=dept.id, name=dept.name, description=dept.description,
        manager_id=dept.manager_id, status=dept.status,
        manager_name=dept.manager.name if dept.manager else None,
        employee_count=emp_count,
    )

@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(dept_id: int, data: DepartmentUpdate, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR"]))):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(dept, key, value)
    db.commit()
    db.refresh(dept)
    return DepartmentResponse(id=dept.id, name=dept.name, description=dept.description,
                               manager_id=dept.manager_id, status=dept.status)

@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(dept_id: int, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin"]))):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
