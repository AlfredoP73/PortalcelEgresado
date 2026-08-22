from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from typing import Optional
from datetime import datetime
from app.graduates import models, schemas
import app.companies.models as company_models
from app.core.adapters import RabbitMQMatchmakingAdapter

import httpx

COMPANIES_URL = "http://companies:8000/api/internal"

def get_jobs(skip: int, limit: int, q: Optional[str], salary_min: Optional[int], db: Session):
    params = {"skip": skip, "limit": limit}
    if q: params["q"] = q
    if salary_min: params["salary_min"] = salary_min
    
    with httpx.Client() as client:
        try:
            response = client.get(f"{COMPANIES_URL}/jobs", params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error conectando con Companies: {str(e)}")

def apply_for_job(application: schemas.ApplicationCreate, current_user: dict, db: Session):
    with httpx.Client() as client:
        try:
            response = client.post(
                f"{COMPANIES_URL}/applications/apply", 
                json={"graduate_id": current_user["id"], "job_offer_id": application.job_offer_id}
            )
            if response.status_code == 400:
                raise HTTPException(status_code=400, detail=response.json().get("detail", "Error al aplicar"))
            response.raise_for_status()
            return response.json()
        except HTTPException as he:
            raise he
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error conectando con Companies: {str(e)}")

def get_my_applications(current_user: dict, db: Session):
    with httpx.Client() as client:
        try:
            response = client.get(f"{COMPANIES_URL}/applications/graduate/{current_user['id']}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error conectando con Companies: {str(e)}")

def get_surveys(db: Session):
    return db.query(models.Survey).filter(models.Survey.is_active == True).all()

def get_survey_response(survey_id: int, current_user: dict, db: Session):
    response = db.query(models.SurveyResponse).filter(
        models.SurveyResponse.survey_id == survey_id,
        models.SurveyResponse.graduate_id == current_user["id"]
    ).first()
    return response

def submit_survey_response(survey_id: int, answers: list, current_user: dict, db: Session):
    existing = db.query(models.SurveyResponse).filter_by(
        survey_id=survey_id, graduate_id=current_user["id"]
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya has respondido esta encuesta")
        
    survey = db.query(models.Survey).filter(models.Survey.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Encuesta no encontrada")

    answers_dict = {a.question_id: a.answer for a in answers}
    new_response = models.SurveyResponse(
        survey_id=survey_id,
        graduate_id=current_user["id"],
        answers_json=answers_dict
    )
    db.add(new_response)
    db.commit()
    db.refresh(new_response)
    
    adapter = RabbitMQMatchmakingAdapter()
    adapter.trigger_recalculate(graduate_id=current_user["id"])
    
    return {"detail": "Encuesta enviada"}
