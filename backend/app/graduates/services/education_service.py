from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import uuid
import os
import shutil
from app.graduates import models, schemas
from app.graduates.services.graduate_service import s3_client, MINIO_BUCKET_NAME

def add_academic_history(history: schemas.AcademicHistoryCreate, current_user: dict, db: Session):
    db_hist = models.AcademicHistory(**history.model_dump(), graduate_id=current_user["id"])
    db.add(db_hist)
    db.commit()
    db.refresh(db_hist)
    return db_hist

def delete_academic_history(hist_id: int, current_user: dict, db: Session):
    db_hist = db.query(models.AcademicHistory).filter(models.AcademicHistory.id == hist_id, models.AcademicHistory.graduate_id == current_user["id"]).first()
    if not db_hist:
        raise HTTPException(status_code=404, detail="Historial no encontrado")
    db.delete(db_hist)
    db.commit()
    return {"detail": "Eliminado"}

def upload_education_diploma(edu_id: int, file: UploadFile, current_user: dict, db: Session):
    db_edu = db.query(models.AcademicHistory).filter(models.AcademicHistory.id == edu_id, models.AcademicHistory.graduate_id == current_user["id"]).first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Historial académico no encontrado")
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
        raise HTTPException(status_code=500, detail=f"Error al subir el diploma a MinIO: {str(e)}")
        
    db_edu.diploma_url = f"/api/modulo1/files/{filename}"
    db.commit()
    return {"message": "Diploma subido exitosamente", "diploma_url": db_edu.diploma_url}
