from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import shutil
import uuid
import os
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.auth.models import User
from app.auth.utils.auth_utils import get_password_hash
from app.auth.utils.auth_utils import get_current_user
from app.auth.rbac import RoleChecker
from . import models, schemas
import app.companies.models as company_models

# Role checkers
require_graduate = RoleChecker(["GRADUATE"])
require_admin = RoleChecker(["ADMIN"])

router = APIRouter(
    prefix="/api/modulo1",
    tags=["modulo1"],
    dependencies=[Depends(get_current_user)]
)

# ── RUTAS DE ADMINISTRADOR ──
@router.post("/admin/graduates", response_model=schemas.Graduate, dependencies=[Depends(require_admin)])
def admin_create_graduate(body: schemas.AdminGraduateCreate, db: Session = Depends(get_db)):
    # 1. Verificar si el email ya existe
    existing_user = db.query(User).filter(User.email == body.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
        
    # 2. Crear usuario (rol 3 = GRADUATE por defecto según el init.sql, asumimos 3 para egresado)
    new_user = User(
        email=body.email,
        password_hash=get_password_hash(body.password),
        role_id=3
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 3. Crear el perfil de egresado
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

@router.get("/admin/graduates", response_model=List[schemas.Graduate], dependencies=[Depends(require_admin)])
def admin_get_all_graduates(db: Session = Depends(get_db)):
    return db.query(models.Graduate).all()

@router.get("/admin/applications", response_model=List[schemas.Application], dependencies=[Depends(require_admin)])
def admin_get_all_applications(db: Session = Depends(get_db)):
    return db.query(company_models.CandidateApplication).options(
        joinedload(company_models.CandidateApplication.job_offer)
        .joinedload(company_models.JobOffer.company)
        .joinedload(company_models.Company.sector),
        joinedload(company_models.CandidateApplication.job_offer)
        .joinedload(company_models.JobOffer.company)
        .joinedload(company_models.Company.city),
    ).all()

@router.get("/profile", response_model=schemas.Graduate)
def get_profile(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    profile = db.query(models.Graduate).filter(models.Graduate.user_id == current_user["id"]).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return profile

@router.post("/profile", response_model=schemas.Graduate)
def create_or_update_profile(profile: schemas.GraduateCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
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
    return db_profile

@router.post("/experiences", response_model=schemas.WorkExperience)
def add_experience(experience: schemas.WorkExperienceCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_exp = models.WorkExperience(**experience.model_dump(), graduate_id=current_user["id"])
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.delete("/experiences/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_exp = db.query(models.WorkExperience).filter(models.WorkExperience.id == exp_id, models.WorkExperience.graduate_id == current_user["id"]).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiencia no encontrada")
    db.delete(db_exp)
    db.commit()
    return {"detail": "Eliminada"}

@router.post("/academic_histories", response_model=schemas.AcademicHistory)
def add_academic_history(history: schemas.AcademicHistoryCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_hist = models.AcademicHistory(**history.model_dump(), graduate_id=current_user["id"])
    db.add(db_hist)
    db.commit()
    db.refresh(db_hist)
    return db_hist

@router.delete("/academic_histories/{hist_id}")
def delete_academic_history(hist_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_hist = db.query(models.AcademicHistory).filter(models.AcademicHistory.id == hist_id, models.AcademicHistory.graduate_id == current_user["id"]).first()
    if not db_hist:
        raise HTTPException(status_code=404, detail="Historial no encontrado")
    db.delete(db_hist)
    db.commit()
    return {"detail": "Eliminado"}

@router.post("/certifications", response_model=schemas.Certification)
def add_certification(cert: schemas.CertificationCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_cert = models.Certification(**cert.model_dump(), graduate_id=current_user["id"])
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@router.delete("/certifications/{cert_id}")
def delete_certification(cert_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_cert = db.query(models.Certification).filter(models.Certification.id == cert_id, models.Certification.graduate_id == current_user["id"]).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certificación no encontrada")
    db.delete(db_cert)
    db.commit()
    return {"detail": "Eliminada"}

@router.post("/cv")
def upload_cv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_profile = db.query(models.Graduate).filter(models.Graduate.user_id == current_user["id"]).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Debes completar tu perfil antes de subir tu CV")
        
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser PDF")
        
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join("uploads", "cvs", filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_profile.cv_url = f"/uploads/cvs/{filename}"
    db.commit()
    return {"message": "CV subido exitosamente", "cv_url": db_profile.cv_url}

@router.post("/experiences/{exp_id}/certificate")
def upload_experience_certificate(exp_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_exp = db.query(models.WorkExperience).filter(models.WorkExperience.id == exp_id, models.WorkExperience.graduate_id == current_user["id"]).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiencia no encontrada")
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser PDF")
        
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join("uploads", "cvs", filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_exp.certificate_url = f"/uploads/cvs/{filename}"
    db.commit()
    return {"message": "Certificado subido exitosamente", "certificate_url": db_exp.certificate_url}

@router.post("/education/{edu_id}/diploma")
def upload_education_diploma(edu_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    db_edu = db.query(models.AcademicHistory).filter(models.AcademicHistory.id == edu_id, models.AcademicHistory.graduate_id == current_user["id"]).first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Historial académico no encontrado")
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser PDF")
        
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join("uploads", "cvs", filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_edu.diploma_url = f"/uploads/cvs/{filename}"
    db.commit()
    return {"message": "Diploma subido exitosamente", "diploma_url": db_edu.diploma_url}

# Job Board for graduates
@router.get("/jobs", response_model=List[schemas.JobOffer])
def get_jobs(
    skip: int = 0, 
    limit: int = 100, 
    q: Optional[str] = None,
    salary_min: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(company_models.JobOffer).filter(company_models.JobOffer.status == company_models.JobOfferStatus.ACTIVE)
    if q:
        query = query.filter(company_models.JobOffer.title.ilike(f"%{q}%"))
    if salary_min:
        query = query.filter(company_models.JobOffer.salary_min >= salary_min)
    
    return query.offset(skip).limit(limit).all()

@router.post("/applications", response_model=schemas.Application, dependencies=[Depends(require_graduate)])
def apply_for_job(application: schemas.ApplicationCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing = db.query(company_models.CandidateApplication).filter(
        company_models.CandidateApplication.job_offer_id == application.job_offer_id,
        company_models.CandidateApplication.graduate_id == current_user["id"]
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya te has postulado a esta vacante")
    
    new_app = company_models.CandidateApplication(
        job_offer_id=application.job_offer_id,
        graduate_id=current_user["id"],
        application_date=datetime.now()
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.get("/my-applications", response_model=List[schemas.Application], dependencies=[Depends(require_graduate)])
def get_my_applications(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(company_models.CandidateApplication).options(
        joinedload(company_models.CandidateApplication.job_offer)
        .joinedload(company_models.JobOffer.company)
        .joinedload(company_models.Company.sector),
        joinedload(company_models.CandidateApplication.job_offer)
        .joinedload(company_models.JobOffer.company)
        .joinedload(company_models.Company.city),
    ).filter(
        company_models.CandidateApplication.graduate_id == current_user["id"]
    ).all()

# ── ENCUESTAS (SURVEYS) ──
@router.get("/surveys", response_model=List[schemas.Survey], dependencies=[Depends(require_graduate)])
def get_surveys(db: Session = Depends(get_db)):
    return db.query(models.Survey).filter(models.Survey.is_active == True).all()

@router.get("/surveys/{survey_id}/response", dependencies=[Depends(require_graduate)])
def get_survey_response(survey_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    response = db.query(models.SurveyResponse).filter(
        models.SurveyResponse.survey_id == survey_id,
        models.SurveyResponse.graduate_id == current_user["id"]
    ).first()
    return response

@router.post("/surveys/{survey_id}/response", response_model=schemas.SurveyResponse, dependencies=[Depends(require_graduate)])
def submit_survey_response(survey_id: int, answers: dict, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing = db.query(models.SurveyResponse).filter(
        models.SurveyResponse.survey_id == survey_id,
        models.SurveyResponse.graduate_id == current_user["id"]
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya has respondido esta encuesta")
        
    new_response = models.SurveyResponse(
        survey_id=survey_id,
        graduate_id=current_user["id"],
        answers_json=answers
    )
    db.add(new_response)
    db.commit()
    db.refresh(new_response)
    return new_response
