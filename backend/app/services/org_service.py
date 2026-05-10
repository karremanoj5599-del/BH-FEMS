from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import Department, Team, Employee, Role
from app.schemas.department import DepartmentCreate, DepartmentUpdate
from app.schemas.team import TeamCreate, TeamUpdate
from app.schemas.role import RoleCreate, RoleUpdate

class OrgService:
    # ---- Roles ----
    @staticmethod
    def get_roles(db: Session):
        return db.query(Role).all()

    @staticmethod
    def create_role(db: Session, data: RoleCreate):
        if db.query(Role).filter(Role.name == data.name).first():
            raise HTTPException(status_code=400, detail="Role already exists")
        
        # Extract data and handle description gracefully
        role_dict = data.model_dump()
        role = Role(**role_dict)
        
        try:
            db.add(role)
            db.commit()
            db.refresh(role)
            return role
        except Exception as e:
            db.rollback()
            # If description is the problem, try without it
            if "description" in str(e).lower():
                role_dict.pop("description", None)
                role = Role(**role_dict)
                db.add(role)
                db.commit()
                db.refresh(role)
                return role
            raise e

    @staticmethod
    def update_role(db: Session, role_id: int, data: RoleUpdate):
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role: raise HTTPException(status_code=404, detail="Role not found")
        
        update_data = data.model_dump(exclude_unset=True)
        
        try:
            for key, value in update_data.items():
                setattr(role, key, value)
            db.commit()
        except Exception as e:
            db.rollback()
            if "description" in str(e).lower():
                update_data.pop("description", None)
                for key, value in update_data.items():
                    setattr(role, key, value)
                db.commit()
            else:
                raise e
                
        db.refresh(role)
        return role

    @staticmethod
    def delete_role(db: Session, role_id: int):
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role: raise HTTPException(status_code=404, detail="Role not found")
        db.delete(role)
        db.commit()
        return True
    # ---- Departments ----
    @staticmethod
    def get_departments(db: Session):
        return db.query(Department).all()

    @staticmethod
    def create_department(db: Session, data: DepartmentCreate):
        if db.query(Department).filter(Department.name == data.name).first():
            raise HTTPException(status_code=400, detail="Department already exists")
        dept = Department(**data.model_dump())
        db.add(dept)
        db.commit()
        db.refresh(dept)
        return dept

    @staticmethod
    def get_department(db: Session, dept_id: int):
        dept = db.query(Department).filter(Department.id == dept_id).first()
        if not dept: raise HTTPException(status_code=404, detail="Department not found")
        return dept

    @staticmethod
    def update_department(db: Session, dept_id: int, data: DepartmentUpdate):
        dept = db.query(Department).filter(Department.id == dept_id).first()
        if not dept: raise HTTPException(status_code=404, detail="Department not found")
        for key, value in data.model_dump(exclude_unset=True).items(): setattr(dept, key, value)
        db.commit()
        db.refresh(dept)
        return dept

    @staticmethod
    def delete_department(db: Session, dept_id: int):
        dept = db.query(Department).filter(Department.id == dept_id).first()
        if not dept: raise HTTPException(status_code=404, detail="Department not found")
        db.delete(dept)
        db.commit()
        return True

    # ---- Teams ----
    @staticmethod
    def get_teams(db: Session):
        return db.query(Team).all()

    @staticmethod
    def create_team(db: Session, data: TeamCreate):
        team = Team(name=data.name, department_id=data.department_id, team_lead_id=data.team_lead_id)
        if data.member_ids:
            team.members = db.query(Employee).filter(Employee.id.in_(data.member_ids)).all()
        db.add(team)
        db.commit()
        db.refresh(team)
        return team

    @staticmethod
    def get_team(db: Session, team_id: int):
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team: raise HTTPException(status_code=404, detail="Team not found")
        return team

    @staticmethod
    def update_team(db: Session, team_id: int, data: TeamUpdate):
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team: raise HTTPException(status_code=404, detail="Team not found")
        if data.name is not None: team.name = data.name
        if data.department_id is not None: team.department_id = data.department_id
        if data.team_lead_id is not None: team.team_lead_id = data.team_lead_id
        if data.member_ids is not None:
            team.members = db.query(Employee).filter(Employee.id.in_(data.member_ids)).all()
        db.commit()
        db.refresh(team)
        return team

    @staticmethod
    def delete_team(db: Session, team_id: int):
        team = db.query(Team).filter(Team.id == team_id).first()
        if not team: raise HTTPException(status_code=404, detail="Team not found")
        db.delete(team)
        db.commit()
        return True
