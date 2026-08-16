from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.auth.rbac import RoleChecker
from app.companies import schemas
from app.companies.services import application_service

require_company = RoleChecker(["COMPANY"])
require_admin_or_company = RoleChecker(["ADMIN", "COMPANY"])

router = APIRouter(
    prefix="/api/modulo2",
    tags=["Postulaciones y Talent Pool"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/applications", response_model=schemas.Application) 
def create_application(app: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    return application_service.create_application(app, db)

@router.get("/applications/job/{job_offer_id}", response_model=List[schemas.ApplicationWithCandidate], dependencies=[Depends(require_admin_or_company)])
def get_applications_by_job(job_offer_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return application_service.get_applications_by_job(job_offer_id, current_user, db)

@router.put("/applications/{application_id}/status", response_model=schemas.Application, dependencies=[Depends(require_company)])
def update_application_status(application_id: int, status_update: schemas.ApplicationUpdateStatus, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return application_service.update_application_status(application_id, status_update, current_user, db)

@router.get("/applications/{application_id}/candidate", response_model=schemas.GraduateWithContact, dependencies=[Depends(require_admin_or_company)])
def get_application_candidate(application_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return application_service.get_application_candidate(application_id, current_user, db)

@router.get("/talent-pool", response_model=List[schemas.GraduateWithContact], dependencies=[Depends(require_admin_or_company)])
def get_talent_pool(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return application_service.get_talent_pool(db)
