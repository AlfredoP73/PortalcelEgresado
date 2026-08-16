from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, UploadFile
from typing import Optional
import uuid
import os
import shutil
from app.graduates import models, schemas
from app.auth.models import User
from app.auth.utils.auth_utils import get_password_hash
import app.companies.models as company_models

def admin_get_all_applications(db: Session):
    return db.query(company_models.CandidateApplication).options(
        joinedload(company_models.CandidateApplication.job_offer)
        .joinedload(company_models.JobOffer.company)
        .joinedload(company_models.Company.sector),
        joinedload(company_models.CandidateApplication.job_offer)
        .joinedload(company_models.JobOffer.company)
        .joinedload(company_models.Company.city),
    ).all()

def admin_create_graduate(body: schemas.AdminGraduateCreate, db: Session):
    existing_user = db.query(User).filter(User.email == body.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
        
    new_user = User(
        email=body.email,
        password_hash=get_password_hash(body.password),
        role_id=3
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    new_grad = models.Graduate(
        user_id=new_user.id,
        first_name=body.first_name,
        last_name=body.last_name,
        program_id=body.program_id,
        graduation_year=body.graduation_year,
        phone=body.phone
    )
    db.add(new_grad)
    db.commit()
    db.refresh(new_grad)
    return new_grad

def admin_get_all_graduates(db: Session):
    return db.query(models.Graduate).all()

def get_profile(current_user: dict, db: Session):
    profile = db.query(models.Graduate).filter(models.Graduate.user_id == current_user["id"]).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return profile

def create_or_update_profile(profile: schemas.GraduateCreate, current_user: dict, db: Session):
    db_profile = db.query(models.Graduate).filter(models.Graduate.user_id == current_user["id"]).first()
    
    if db_profile:
        for key, value in profile.model_dump(exclude_unset=True).items():
            setattr(db_profile, key, value)
    else:
        profile_data = profile.model_dump(exclude={"user_id"})
        db_profile = models.Graduate(**profile_data, user_id=current_user["id"])
        db.add(db_profile)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

def upload_cv(file: UploadFile, current_user: dict, db: Session):
    db_profile = db.query(models.Graduate).filter(models.Graduate.user_id == current_user["id"]).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Debes completar tu perfil antes de subir tu CV")
        
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser PDF")
        
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join("uploads", "cvs", filename)
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_profile.cv_url = f"/uploads/cvs/{filename}"
    db.commit()
    return {"message": "CV subido exitosamente", "cv_url": db_profile.cv_url}

def add_certification(cert: schemas.CertificationCreate, current_user: dict, db: Session):
    db_cert = models.Certification(**cert.model_dump(), graduate_id=current_user["id"])
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

def delete_certification(cert_id: int, current_user: dict, db: Session):
    db_cert = db.query(models.Certification).filter(models.Certification.id == cert_id, models.Certification.graduate_id == current_user["id"]).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certificación no encontrada")
    db.delete(db_cert)
    db.commit()
    return {"detail": "Eliminada"}
