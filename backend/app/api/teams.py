from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import RoleChecker
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse
from app.services.org_service import OrgService

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get("/", response_model=list[TeamResponse])
def list_teams(db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR", "Manager", "Supervisor"]))):
    teams = OrgService.get_teams(db)
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
    team = OrgService.create_team(db, data)
    return TeamResponse(
        id=team.id, name=team.name, department_id=team.department_id,
        team_lead_id=team.team_lead_id,
        department_name=team.department.name if team.department else None,
        team_lead_name=team.team_lead.name if team.team_lead else None,
        member_count=len(team.members),
    )

@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR", "Manager", "Supervisor"]))):
    team = OrgService.get_team(db, team_id)
    return TeamResponse(
        id=team.id, name=team.name, department_id=team.department_id,
        team_lead_id=team.team_lead_id,
        department_name=team.department.name if team.department else None,
        team_lead_name=team.team_lead.name if team.team_lead else None,
        member_count=len(team.members),
    )

@router.put("/{team_id}", response_model=TeamResponse)
def update_team(team_id: int, data: TeamUpdate, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin", "HR"]))):
    team = OrgService.update_team(db, team_id, data)
    return TeamResponse(
        id=team.id, name=team.name, department_id=team.department_id,
        team_lead_id=team.team_lead_id, member_count=len(team.members),
    )

@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: int, db: Session = Depends(get_db), _=Depends(RoleChecker(["Admin"]))):
    OrgService.delete_team(db, team_id)
    return None
