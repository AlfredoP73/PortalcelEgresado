from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.companies import models, schemas

from app.core.adapters import HttpMatchmakingAdapter

def create_job_offer(body: schemas.JobOfferCreate, current_user: dict, db: Session):
    company = db.query(models.Company).filter(models.Company.user_id == current_user["id"]).first()
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    db_offer = models.JobOffer(
        company_id=company.user_id,
        title=body.title,
        description=body.description,
        program_id=body.program_id,
        min_experience_years=body.min_experience_years,
        salary_min=body.salary_min,
        salary_max=body.salary_max,
        city_id=body.city_id,
        contract_type=body.contract_type,
        work_model=body.work_model,
        status="ACTIVE"
    )
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)

    # Save skills
    for req_skill in body.required_skills:
        skill = models.JobOfferSkill(
            job_offer_id=db_offer.id,
            skill_id=req_skill.skill_id,
            required_level=req_skill.required_level
        )
        db.add(skill)
    db.commit()

    adapter = HttpMatchmakingAdapter()
    adapter.trigger_recalculate(job_offer_id=db_offer.id)

    return db_offer

def get_job_offers(skip: int, limit: int, current_user: dict, db: Session):
    if current_user["role_id"] == 1: # ADMIN
        return db.query(models.JobOffer).offset(skip).limit(limit).all()
    return db.query(models.JobOffer).filter(models.JobOffer.company_id == current_user["id"]).offset(skip).limit(limit).all()
