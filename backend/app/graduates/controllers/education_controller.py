from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.graduates import schemas
from app.graduates.services import education_service

router = APIRouter(
    prefix="/api/modulo1",
    tags=["Historial Académico"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/academic_histories", response_model=schemas.AcademicHistory)
def add_academic_history(history: schemas.AcademicHistoryCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return education_service.add_academic_history(history, current_user, db)

@router.delete("/academic_histories/{hist_id}")
def delete_academic_history(hist_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return education_service.delete_academic_history(hist_id, current_user, db)

@router.post("/education/{edu_id}/diploma")
def upload_education_diploma(edu_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return education_service.upload_education_diploma(edu_id, file, current_user, db)
