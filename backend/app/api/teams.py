from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import RoleChecker
from app.models import Team, Employee
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get("/", response_model=list[TeamResponse])
def list_teams(db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR", "Manager", "Supervisor"]))):
    teams = db.query(Team).all()
    result = []
    for team in teams:
        result.append(TeamResponse(
            id=team.id, name=team.name, department_id=team.department_id,
            team_lead_id=team.team_lead_id,
            department_name=team.department.name if team.department else None,
            team_lead_name=team.team_lead.name if team.team_lead else None,
            member_count=len(team.members),
        ))
    return result

@router.post("/", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(data: TeamCreate, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR"]))):
    team = Team(name=data.name, department_id=data.department_id, team_lead_id=data.team_lead_id)

    if data.member_ids:
        members = db.query(Employee).filter(Employee.id.in_(data.member_ids)).all()
        team.members = members

    db.add(team)
    db.commit()
    db.refresh(team)
    return TeamResponse(
        id=team.id, name=team.name, department_id=team.department_id,
        team_lead_id=team.team_lead_id,
        department_name=team.department.name if team.department else None,
        team_lead_name=team.team_lead.name if team.team_lead else None,
        member_count=len(team.members),
    )

@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR", "Manager", "Supervisor"]))):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return TeamResponse(
        id=team.id, name=team.name, department_id=team.department_id,
        team_lead_id=team.team_lead_id,
        department_name=team.department.name if team.department else None,
        team_lead_name=team.team_lead.name if team.team_lead else None,
        member_count=len(team.members),
    )

@router.put("/{team_id}", response_model=TeamResponse)
def update_team(team_id: int, data: TeamUpdate, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR"]))):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if data.name is not None:
        team.name = data.name
    if data.department_id is not None:
        team.department_id = data.department_id
    if data.team_lead_id is not None:
        team.team_lead_id = data.team_lead_id
    if data.member_ids is not None:
        members = db.query(Employee).filter(Employee.id.in_(data.member_ids)).all()
        team.members = members

    db.commit()
    db.refresh(team)
    return TeamResponse(
        id=team.id, name=team.name, department_id=team.department_id,
        team_lead_id=team.team_lead_id, member_count=len(team.members),
    )

@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: int, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin"]))):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(team)
    db.commit()
