"""
Authentication API endpoints for HyperCube.
Supports login, user registration (with local SQLite persistence),
and listing of available test accounts.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from backend.app.services.auth_db import auth_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    company: Optional[str] = "Empresa Demonstrativa"
    role: Optional[str] = "Planejador FP&A"


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    company: Optional[str] = None
    role: Optional[str] = None
    token: str


@router.post("/register", response_model=Dict[str, Any])
def register(payload: RegisterRequest):
    """
    Registers any user into the local SQLite database.
    Allows easy testing with any email and password.
    """
    try:
        user = auth_db.register_user(
            name=payload.name,
            email=payload.email,
            password=payload.password,
            company=payload.company,
            role=payload.role
        )
        return {
            "status": "success",
            "message": "Usuário cadastrado com sucesso no banco SQLite local.",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "company": user["company"],
                "role": user["role"]
            },
            "token": f"hypercube_token_{user['id']}_{user['email']}"
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao cadastrar usuário: {str(e)}"
        )


@router.post("/login", response_model=Dict[str, Any])
def login(payload: LoginRequest):
    """
    Authenticates user against the local SQLite database.
    """
    user = auth_db.authenticate_user(email=payload.email, password=payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas. Verifique o e-mail e a senha digitados."
        )

    return {
        "status": "success",
        "message": "Autenticado com sucesso.",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "company": user["company"],
            "role": user["role"]
        },
        "token": f"hypercube_token_{user['id']}_{user['email']}"
    }


@router.get("/users")
def get_test_users():
    """
    Lists all users stored in the local SQLite database for test convenience.
    """
    users = auth_db.list_users()
    return {
        "count": len(users),
        "users": users
    }


@router.get("/me")
def get_current_user(email: Optional[str] = None):
    """
    Returns user details for an active email or default admin if not provided.
    """
    if email:
        user = auth_db.get_user_by_email(email)
        if user:
            return {"user": user}

    # Return default first user
    users = auth_db.list_users()
    if users:
        return {"user": users[0]}
    return {"user": None}
