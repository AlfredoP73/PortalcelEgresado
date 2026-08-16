from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import uuid
import os
import shutil
from app.graduates import models, schemas

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
    filepath = os.path.join("uploads", "cvs", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_edu.diploma_url = f"/uploads/cvs/{filename}"
    db.commit()
    return {"message": "Diploma subido exitosamente", "diploma_url": db_edu.diploma_url}
