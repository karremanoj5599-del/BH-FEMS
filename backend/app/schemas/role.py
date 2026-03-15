"""
FEMS - Pydantic Schemas for Roles
"""
from pydantic import BaseModel
from typing import Optional


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[str] = None  # JSON string


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[str] = None


class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    permissions: Optional[str] = None

    class Config:
        from_attributes = True
