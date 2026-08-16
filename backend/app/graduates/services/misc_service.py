from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from typing import Optional
from datetime import datetime
from app.graduates import models, schemas
import app.companies.models as company_models

def get_jobs(skip: int, limit: int, q: Optional[str], salary_min: Optional[int], db: Session):
    query = db.query(company_models.JobOffer).filter(company_models.JobOffer.status == company_models.JobOfferStatus.ACTIVE)
    if q:
        query = query.filter(company_models.JobOffer.title.ilike(f"%{q}%"))
    if salary_min:
        query = query.filter(company_models.JobOffer.salary_min >= salary_min)
    return query.offset(skip).limit(limit).all()

def apply_for_job(application: schemas.ApplicationCreate, current_user: dict, db: Session):
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

def get_my_applications(current_user: dict, db: Session):
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

def get_surveys(db: Session):
    return db.query(models.Survey).filter(models.Survey.is_active == True).all()

def get_survey_response(survey_id: int, current_user: dict, db: Session):
    response = db.query(models.SurveyResponse).filter(
        models.SurveyResponse.survey_id == survey_id,
        models.SurveyResponse.graduate_id == current_user["id"]
    ).first()
    return response

def submit_survey_response(survey_id: int, answers: dict, current_user: dict, db: Session):
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
