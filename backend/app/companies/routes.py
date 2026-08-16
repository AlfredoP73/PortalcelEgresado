from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.auth.rbac import RoleChecker
from . import models, schemas

# Role checkers
require_admin = RoleChecker(["ADMIN"])
require_company = RoleChecker(["COMPANY"])
require_admin_or_company = RoleChecker(["ADMIN", "COMPANY"])

router = APIRouter(
    prefix="/api/modulo2",
    tags=["modulo2"],
    dependencies=[Depends(get_current_user)]
)

# --- Catalogs ---
@router.get("/sectors", response_model=List[schemas.Sector])
def get_sectors(db: Session = Depends(get_db)):
    return db.query(models.Sector).all()

@router.post("/sectors", response_model=schemas.Sector, dependencies=[Depends(require_admin)])
def create_sector(sector: schemas.SectorCreate, db: Session = Depends(get_db)):
    db_sector = models.Sector(**sector.model_dump())
    db.add(db_sector)
    db.commit()
    db.refresh(db_sector)
    return db_sector

@router.get("/cities", response_model=List[schemas.City])
def get_cities(db: Session = Depends(get_db)):
    return db.query(models.City).all()

@router.post("/cities", response_model=schemas.City, dependencies=[Depends(require_admin)])
def create_city(city: schemas.CityCreate, db: Session = Depends(get_db)):
    db_city = models.City(**city.model_dump())
    db.add(db_city)
    db.commit()
    db.refresh(db_city)
    return db_city

@router.get("/programs", response_model=List[schemas.Program])
def get_programs(db: Session = Depends(get_db)):
    return db.query(models.Program).all()

@router.post("/programs", response_model=schemas.Program, dependencies=[Depends(require_admin)])
def create_program(program: schemas.ProgramCreate, db: Session = Depends(get_db)):
    db_program = models.Program(**program.model_dump())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program

# --- Companies ---
@router.post("/companies", response_model=schemas.Company, dependencies=[Depends(require_admin_or_company)])
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_id = company.user_id if (current_user["role_id"] == 1 and company.user_id) else current_user["id"]
    if not user_id:
        raise HTTPException(status_code=400, detail="Falta user_id para la empresa")
    
    # Check if company already exists
    if db.query(models.Company).filter(models.Company.user_id == user_id).first():
        raise HTTPException(status_code=400, detail="La empresa ya tiene un perfil registrado")

    company_data = company.model_dump(exclude={"user_id"})
    db_company = models.Company(**company_data, user_id=user_id)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.get("/companies", response_model=List[schemas.Company], dependencies=[Depends(require_admin_or_company)])
def get_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role_id"] == 1: # ADMIN
        return db.query(models.Company).offset(skip).limit(limit).all()
    # COMPANY can only see themselves (or nothing in the list, but let's return their own profile in a list for UI compatibility)
    return db.query(models.Company).filter(models.Company.user_id == current_user["id"]).all()

@router.put("/companies/{company_id}/status", response_model=schemas.Company, dependencies=[Depends(require_admin)])
def update_company_status(company_id: int, status_update: schemas.CompanyUpdateStatus, db: Session = Depends(get_db)):
    db_company = db.query(models.Company).filter(models.Company.user_id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    db_company.status = status_update.status
    db.commit()
    db.refresh(db_company)
    return db_company

@router.put("/companies/{company_id}", response_model=schemas.Company, dependencies=[Depends(require_admin)])
def update_company(company_id: int, company_update: schemas.CompanyCreate, db: Session = Depends(get_db)):
    db_company = db.query(models.Company).filter(models.Company.user_id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = company_update.model_dump(exclude_unset=True, exclude={"user_id"})
    for key, value in update_data.items():
        setattr(db_company, key, value)
        
    db.commit()
    db.refresh(db_company)
    return db_company

@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_company(company_id: int, db: Session = Depends(get_db)):
    db_company = db.query(models.Company).filter(models.Company.user_id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    db.delete(db_company)
    db.commit()
    return None

# --- Job Offers ---
@router.post("/jobs", response_model=schemas.JobOffer, dependencies=[Depends(require_company)])
def create_job_offer(job: schemas.JobOfferCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if job.company_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="No puedes crear vacantes para otra empresa")
    db_job = models.JobOffer(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/jobs", response_model=List[schemas.JobOffer], dependencies=[Depends(require_admin_or_company)])
def get_job_offers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role_id"] == 1: # ADMIN
        return db.query(models.JobOffer).offset(skip).limit(limit).all()
    return db.query(models.JobOffer).filter(models.JobOffer.company_id == current_user["id"]).offset(skip).limit(limit).all()

# --- Applications ---
@router.post("/applications", response_model=schemas.Application) # Any role could apply logically, but Module 2 is Company. Graduate applies in Module 1. We leave this open or restricted to Graduate later.
def create_application(app: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    db_app = models.CandidateApplication(**app.model_dump())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

@router.get("/applications/job/{job_offer_id}", response_model=List[schemas.Application], dependencies=[Depends(require_admin_or_company)])
def get_applications_by_job(job_offer_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role_id"] != 1: # If not Admin, verify company owns this job offer
        job = db.query(models.JobOffer).filter(models.JobOffer.id == job_offer_id, models.JobOffer.company_id == current_user["id"]).first()
        if not job:
            raise HTTPException(status_code=403, detail="No tienes acceso a esta vacante")
    return db.query(models.CandidateApplication).filter(
        models.CandidateApplication.job_offer_id == job_offer_id
    ).all()

@router.put("/applications/{application_id}/status", response_model=schemas.Application, dependencies=[Depends(require_company)])
def update_application_status(application_id: int, status_update: schemas.ApplicationUpdateStatus, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_app = db.query(models.CandidateApplication).join(models.JobOffer).filter(
        models.CandidateApplication.id == application_id,
        models.JobOffer.company_id == current_user["id"]
    ).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found or unauthorized")
    db_app.status = status_update.status
    db.commit()
    db.refresh(db_app)
    return db_app