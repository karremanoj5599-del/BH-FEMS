"""
FEMS - Pydantic Schemas for Authentication
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    designation: Optional[str] = None
    profile_photo_url: Optional[str] = None
    role_name: Optional[str] = None

    class Config:
        from_attributes = True
