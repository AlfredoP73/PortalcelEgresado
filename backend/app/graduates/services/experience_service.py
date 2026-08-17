from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import uuid
import os
import shutil
from app.graduates import models, schemas
from app.graduates.services.graduate_service import s3_client, MINIO_BUCKET_NAME

def add_experience(experience: schemas.WorkExperienceCreate, current_user: dict, db: Session):
    db_exp = models.WorkExperience(**experience.model_dump(), graduate_id=current_user["id"])
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

def delete_experience(exp_id: int, current_user: dict, db: Session):
    db_exp = db.query(models.WorkExperience).filter(models.WorkExperience.id == exp_id, models.WorkExperience.graduate_id == current_user["id"]).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiencia no encontrada")
    db.delete(db_exp)
    db.commit()
    return {"detail": "Eliminada"}

def upload_experience_certificate(exp_id: int, file: UploadFile, current_user: dict, db: Session):
    db_exp = db.query(models.WorkExperience).filter(models.WorkExperience.id == exp_id, models.WorkExperience.graduate_id == current_user["id"]).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiencia no encontrada")
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser PDF")
        
    filename = f"{uuid.uuid4()}_{file.filename}"
    
    try:
        s3_client.upload_fileobj(
            file.file,
            MINIO_BUCKET_NAME,
            filename,
            ExtraArgs={"ContentType": "application/pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir el certificado a MinIO: {str(e)}")
        
    db_exp.certificate_url = f"/api/modulo1/files/{filename}"
    db.commit()
    return {"message": "Certificado subido exitosamente", "certificate_url": db_exp.certificate_url}
