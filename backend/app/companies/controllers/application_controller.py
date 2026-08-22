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

from app.companies.internal_router import internal_router
from datetime import datetime

@internal_router.get("/applications/graduate/{graduate_id}")
def get_applications_by_graduate_internal(graduate_id: int, db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    from app.companies import models
    return db.query(models.CandidateApplication).options(
        joinedload(models.CandidateApplication.job_offer)
        .joinedload(models.JobOffer.company)
        .joinedload(models.Company.sector),
        joinedload(models.CandidateApplication.job_offer)
        .joinedload(models.JobOffer.company)
        .joinedload(models.Company.city),
    ).filter(
        models.CandidateApplication.graduate_id == graduate_id
    ).all()

@internal_router.post("/applications/apply")
def apply_internal(payload: dict, db: Session = Depends(get_db)):
    from app.companies import models
    from fastapi import HTTPException
    
    graduate_id = payload.get("graduate_id")
    job_offer_id = payload.get("job_offer_id")
    
    existing = db.query(models.CandidateApplication).filter(
        models.CandidateApplication.job_offer_id == job_offer_id,
        models.CandidateApplication.graduate_id == graduate_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya te has postulado a esta vacante")
    
    new_app = models.CandidateApplication(
        job_offer_id=job_offer_id,
        graduate_id=graduate_id,
        application_date=datetime.now()
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@internal_router.get("/applications")
def get_all_applications_internal(db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    from app.companies import models
    return db.query(models.CandidateApplication).options(
        joinedload(models.CandidateApplication.job_offer)
        .joinedload(models.JobOffer.company)
        .joinedload(models.Company.sector),
        joinedload(models.CandidateApplication.job_offer)
        .joinedload(models.JobOffer.company)
        .joinedload(models.Company.city),
    ).all()
