from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import os

from app.auth import models, schemas
from app.auth.utils.auth_utils import verify_password, get_password_hash, create_access_token

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

def get_user_from_token(token: str, db: Session) -> models.User:
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

def authenticate_user(body: schemas.LoginRequest, db: Session) -> schemas.TokenResponse:
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

def register_user(body: schemas.RegisterRequest, db: Session) -> dict:
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="Ya existe un usuario con ese email")

    if not db.query(models.Role).filter(models.Role.id == body.role_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"El rol con id={body.role_id} no existe")

    new_user = models.User(
        email=body.email,
        password_hash=get_password_hash(body.password),
        role_id=body.role_id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Usuario registrado exitosamente", "user_id": new_user.id}

def impersonate_user(body: schemas.ImpersonateRequest, admin_user: models.User, db: Session) -> schemas.TokenResponse:
    if admin_user.role_id != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores pueden impersonar")
        
    target_user = db.query(models.User).filter(models.User.id == body.user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario objetivo no encontrado")
        
    new_token = create_access_token(data={"sub": target_user.email})
    return schemas.TokenResponse(
        access_token=new_token,
        token_type="bearer",
        user=schemas.UserInfo(
            id=target_user.id,
            email=target_user.email,
            role_id=target_user.role_id,
            role_name=target_user.role.name,
        ),
    )

def get_all_users(admin_user: models.User, db: Session) -> list[schemas.UserInfo]:
    if admin_user.role_id != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No autorizado")
        
    users = db.query(models.User).all()
    return [
        schemas.UserInfo(
            id=u.id,
            email=u.email,
            role_id=u.role_id,
            role_name=u.role.name
        )
        for u in users
    ]
