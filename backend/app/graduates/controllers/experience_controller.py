from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.graduates import schemas
from app.graduates.services import experience_service

router = APIRouter(
    prefix="/api/modulo1",
    tags=["Experiencia Laboral"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/experiences", response_model=schemas.WorkExperience)
def add_experience(experience: schemas.WorkExperienceCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return experience_service.add_experience(experience, current_user, db)

@router.delete("/experiences/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return experience_service.delete_experience(exp_id, current_user, db)

@router.post("/experiences/{exp_id}/certificate")
def upload_experience_certificate(exp_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return experience_service.upload_experience_certificate(exp_id, file, current_user, db)
