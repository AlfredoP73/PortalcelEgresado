from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import os

from app.database import get_db
from .utils.auth_utils import verify_password, get_password_hash, create_access_token
from . import models, schemas

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")


def _get_user_from_token(token: str, db: Session) -> models.User:
    """Resuelve el JWT y devuelve el User de la BD o lanza 401."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub", "")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Token inválido o expirado",
                            headers={"WWW-Authenticate": "Bearer"})
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Usuario no encontrado")
    return user


# ── POST /api/auth/login ─────────────────────────────────────────────────────
@router.post("/login", response_model=schemas.TokenResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Recibe email + password y devuelve JWT."""
    user = db.query(models.User).filter(
        models.User.email == body.email,
        models.User.is_active == True,
    ).first()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.email})

    return schemas.TokenResponse(
        access_token=token,
        token_type="bearer",
        user=schemas.UserInfo(
            id=user.id,
            email=user.email,
            role_id=user.role_id,
            role_name=user.role.name,
        ),
    )


# ── POST /api/auth/register ──────────────────────────────────────────────────
@router.post("/register", response_model=schemas.MessageResponse,
             status_code=status.HTTP_201_CREATED)
def register(body: schemas.RegisterRequest, db: Session = Depends(get_db)):
    """Crea un nuevo usuario. Rol por defecto: COMPANY (role_id=2)."""
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Ya existe un usuario con ese email")

    if not db.query(models.Role).filter(models.Role.id == body.role_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"El rol con id={body.role_id} no existe")

    db.add(models.User(
        email=body.email,
        password_hash=get_password_hash(body.password),
        role_id=body.role_id,
    ))
    db.commit()
    return {"message": "Usuario registrado exitosamente"}


# ── GET /api/auth/me ─────────────────────────────────────────────────────────
@router.get("/me", response_model=schemas.UserInfo)
def get_me(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Devuelve la info del usuario autenticado."""
    user = _get_user_from_token(token, db)
    return schemas.UserInfo(
        id=user.id,
        email=user.email,
        role_id=user.role_id,
        role_name=user.role.name,
    )