from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.auth.rbac import RoleChecker
from app.graduates import schemas
from app.graduates.services import graduate_service

require_admin = RoleChecker(["ADMIN"])

router = APIRouter(
    prefix="/api/modulo1",
    tags=["Perfil de Egresado"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/admin/graduates", response_model=schemas.Graduate, dependencies=[Depends(require_admin)])
def admin_create_graduate(body: schemas.AdminGraduateCreate, db: Session = Depends(get_db)):
    return graduate_service.admin_create_graduate(body, db)

@router.get("/admin/graduates", response_model=List[schemas.Graduate], dependencies=[Depends(require_admin)])
def admin_get_all_graduates(db: Session = Depends(get_db)):
    return graduate_service.admin_get_all_graduates(db)

@router.get("/admin/applications", response_model=List[schemas.Application], dependencies=[Depends(require_admin)])
def admin_get_all_applications(db: Session = Depends(get_db)):
    return graduate_service.admin_get_all_applications(db)

@router.get("/profile", response_model=schemas.Graduate)
def get_profile(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return graduate_service.get_profile(current_user, db)

@router.post("/profile", response_model=schemas.Graduate)
def create_or_update_profile(profile: schemas.GraduateCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return graduate_service.create_or_update_profile(profile, current_user, db)

@router.post("/cv")
def upload_cv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return graduate_service.upload_cv(file, current_user, db)

@router.post("/certifications", response_model=schemas.Certification)
def add_certification(cert: schemas.CertificationCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return graduate_service.add_certification(cert, current_user, db)

@router.delete("/certifications/{cert_id}")
def delete_certification(cert_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return graduate_service.delete_certification(cert_id, current_user, db)
