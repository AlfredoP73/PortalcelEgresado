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
    from app.matchmaking.client import trigger_recalcular
    trigger_recalcular(graduate_id=current_user["id"])
    return db_profile

import boto3

# Setup MinIO client
MINIO_URL = os.getenv("MINIO_URL", "http://minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET_NAME = os.getenv("MINIO_BUCKET_NAME", "cvs")

s3_client = boto3.client(
    "s3",
    endpoint_url=MINIO_URL,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
)

def upload_cv(file: UploadFile, current_user: dict, db: Session):
    db_profile = db.query(models.Graduate).filter(models.Graduate.user_id == current_user["id"]).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Debes completar tu perfil antes de subir tu CV")
        
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser PDF")
        
    # Ensure bucket exists
    try:
        s3_client.head_bucket(Bucket=MINIO_BUCKET_NAME)
    except Exception:
        try:
            s3_client.create_bucket(Bucket=MINIO_BUCKET_NAME)
        except Exception as e:
            print(f"Error creating bucket: {e}")

    filename = f"{uuid.uuid4()}_{file.filename}"
    
    try:
        s3_client.upload_fileobj(
            file.file,
            MINIO_BUCKET_NAME,
            filename,
            ExtraArgs={"ContentType": "application/pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir el archivo a MinIO: {str(e)}")
        
    db_profile.cv_url = f"/api/modulo1/files/{filename}"
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
