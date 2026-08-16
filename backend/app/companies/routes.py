from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from . import models, schemas

router = APIRouter(
    prefix="/api/modulo2",
    tags=["modulo2"],
    dependencies=[Depends(get_current_user)]
)

# --- Catalogs ---
@router.get("/sectors", response_model=List[schemas.Sector])
def get_sectors(db: Session = Depends(get_db)):
    return db.query(models.Sector).all()

@router.post("/sectors", response_model=schemas.Sector)
def create_sector(sector: schemas.SectorCreate, db: Session = Depends(get_db)):
    db_sector = models.Sector(**sector.model_dump())
    db.add(db_sector)
    db.commit()
    db.refresh(db_sector)
    return db_sector

@router.get("/cities", response_model=List[schemas.City])
def get_cities(db: Session = Depends(get_db)):
    return db.query(models.City).all()

@router.post("/cities", response_model=schemas.City)
def create_city(city: schemas.CityCreate, db: Session = Depends(get_db)):
    db_city = models.City(**city.model_dump())
    db.add(db_city)
    db.commit()
    db.refresh(db_city)
    return db_city

@router.get("/careers", response_model=List[schemas.Career])
def get_careers(db: Session = Depends(get_db)):
    return db.query(models.Career).all()

@router.post("/careers", response_model=schemas.Career)
def create_career(career: schemas.CareerCreate, db: Session = Depends(get_db)):
    db_career = models.Career(**career.model_dump())
    db.add(db_career)
    db.commit()
    db.refresh(db_career)
    return db_career

# --- Companies ---
@router.post("/companies", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    db_company = models.Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/companies", response_model=List[schemas.Company])
def get_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Company).offset(skip).limit(limit).all()

@router.put("/companies/{company_id}/status", response_model=schemas.Company)
def update_company_status(company_id: int, status_update: schemas.CompanyUpdateStatus, db: Session = Depends(get_db)):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    db_company.status = status_update.status
    db.commit()
    db.refresh(db_company)
    return db_company

# --- Job Offers ---
@router.post("/jobs", response_model=schemas.JobOffer)
def create_job_offer(job: schemas.JobOfferCreate, db: Session = Depends(get_db)):
    db_job = models.JobOffer(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/jobs", response_model=List[schemas.JobOffer])
def get_job_offers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.JobOffer).offset(skip).limit(limit).all()

# --- Applications ---
@router.post("/applications", response_model=schemas.Application)
def create_application(app: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    db_app = models.CandidateApplication(**app.model_dump())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@router.get("/applications/job/{job_offer_id}", response_model=List[schemas.Application])
def get_applications_by_job(job_offer_id: int, db: Session = Depends(get_db)):
    return db.query(models.CandidateApplication).filter(
        models.CandidateApplication.job_offer_id == job_offer_id
    ).all()

@router.put("/applications/{application_id}/status", response_model=schemas.Application)
def update_application_status(application_id: int, status_update: schemas.ApplicationUpdateStatus, db: Session = Depends(get_db)):
    db_app = db.query(models.CandidateApplication).filter(
        models.CandidateApplication.id == application_id
    ).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    db_app.status = status_update.status
    db.commit()
    db.refresh(db_app)
    return db_app