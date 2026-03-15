"""
FEMS - Pydantic Schemas for Teams
"""
from pydantic import BaseModel
from typing import Optional


class TeamCreate(BaseModel):
    name: str
    department_id: int
    team_lead_id: Optional[int] = None
    member_ids: Optional[list[int]] = []


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    department_id: Optional[int] = None
    team_lead_id: Optional[int] = None
    member_ids: Optional[list[int]] = None


class TeamResponse(BaseModel):
    id: int
    name: str
    department_id: int
    team_lead_id: Optional[int] = None
    department_name: Optional[str] = None
    team_lead_name: Optional[str] = None
    member_count: Optional[int] = 0

    class Config:
        from_attributes = True
