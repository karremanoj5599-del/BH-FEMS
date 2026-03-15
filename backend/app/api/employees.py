"""
FEMS - Employees API Routes
"""
import csv
import io
import math
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from app.core.database import get_db
from app.core.security import hash_password, get_current_user, RoleChecker
from app.models import Employee, Role, Department
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeListResponse

router = APIRouter(prefix="/employees", tags=["Employees"])


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
    query = db.query(Employee).options(
        joinedload(Employee.role),
        joinedload(Employee.department),
        joinedload(Employee.team)
    )

    if search:
        query = query.filter(
            or_(
                Employee.name.ilike(f"%{search}%"),
                Employee.employee_id.ilike(f"%{search}%"),
                Employee.email.ilike(f"%{search}%"),
                Employee.phone.ilike(f"%{search}%"),
            )
        )
    if status_filter:
        query = query.filter(Employee.status == status_filter)
    if department_id:
        query = query.filter(Employee.department_id == department_id)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    employees = query.offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for emp in employees:
        items.append(EmployeeResponse(
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
        items=items, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["Admin", "HR"]))
):
    if db.query(Employee).filter(Employee.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(Employee).filter(Employee.employee_id == data.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    emp = Employee(
        **data.model_dump(exclude={"password"}),
        password_hash=hash_password(data.password),
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return EmployeeResponse.model_validate(emp)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    emp = db.query(Employee).options(
        joinedload(Employee.role), joinedload(Employee.department)
    ).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    return EmployeeResponse.model_validate(emp)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["Admin", "HR"]))
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(emp, key, value)

    db.commit()
    db.refresh(emp)
    return EmployeeResponse.model_validate(emp)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["Admin"]))
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()


@router.post("/import-csv")
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["Admin", "HR"]))
):
    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    created = 0
    errors = []

    for i, row in enumerate(reader, start=2):
        try:
            if db.query(Employee).filter(Employee.email == row["email"]).first():
                errors.append(f"Row {i}: Email '{row['email']}' already exists")
                continue
            emp = Employee(
                employee_id=row["employee_id"],
                name=row["name"],
                email=row["email"],
                password_hash=hash_password(row.get("password", "changeme123")),
                phone=row.get("phone"),
                designation=row.get("designation"),
                status=row.get("status", "Active"),
                type=row.get("type", row.get("employee_type", "Permanent")),
            )
            db.add(emp)
            created += 1
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    db.commit()
    return {"created": created, "errors": errors}


@router.get("/export-csv", response_class=StreamingResponse)
def export_csv(
    db: Session = Depends(get_db),
    _=Depends(RoleChecker(["Admin", "HR"]))
):
    employees = db.query(Employee).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["employee_id", "name", "email", "phone", "designation", "status", "type", "department_id"])
    for emp in employees:
        writer.writerow([emp.employee_id, emp.name, emp.email, emp.phone, emp.designation, emp.status, emp.type, emp.department_id])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employees_export.csv"},
    )
