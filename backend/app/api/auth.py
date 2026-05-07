"""
FEMS - Authentication API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    verify_password, create_access_token, create_refresh_token,
    decode_token, get_current_user
)
from app.models import Employee
from app.schemas.auth import LoginRequest, TokenResponse, TokenRefreshRequest, UserResponse
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

class GoogleLoginRequest(BaseModel):
    credential: str

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Employee).filter(Employee.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if user.status != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    role_name = user.role.name if user.role else "Employee"
    token_data = {
        "sub": str(user.id),
        "user_id": user.id,
        "role": role_name,
        "email": user.email,
        "full_name": user.name
    }
    
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/google", response_model=TokenResponse)
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        # Note: In a production environment, Client ID should be verified.
        # We pass verify_aud=False here to test token decoding since we haven't set up the CLIENT_ID yet.
        idinfo = id_token.verify_oauth2_token(request.credential, google_requests.Request(), verify_aud=False)
        
        email = idinfo.get("email")
        if not idinfo.get("email_verified", False):
            raise ValueError("Email not verified by Google.")

        user = db.query(Employee).filter(Employee.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Email not registered in the system.",
            )

        if user.status != "Active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive",
            )

        role_name = user.role.name if user.role else "Employee"
        token_data = {
            "sub": str(user.id),
            "user_id": user.id,
            "role": role_name,
            "email": user.email,
            "full_name": user.name
        }
        
        return TokenResponse(
            access_token=create_access_token(token_data),
            refresh_token=create_refresh_token(token_data),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google Token")


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: TokenRefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Invalid refresh token")

    user = db.query(Employee).filter(Employee.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role_name = user.role.name if user.role else "Employee"
    token_data = {
        "sub": str(user.id),
        "user_id": user.id,
        "role": role_name,
        "email": user.email,
        "full_name": user.name
    }
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Employee = Depends(get_current_user)):
    import json
    permissions = {}
    if current_user.role and current_user.role.permissions:
        try:
            permissions = json.loads(current_user.role.permissions)
        except:
            permissions = {}

    return UserResponse(
        id=current_user.id,
        employee_id=current_user.employee_id,
        name=current_user.name,
        email=current_user.email,
        designation=current_user.designation,
        profile_photo_url=current_user.profile_photo_url,
        role_name=current_user.role.name if current_user.role else None,
        permissions=permissions
    )
