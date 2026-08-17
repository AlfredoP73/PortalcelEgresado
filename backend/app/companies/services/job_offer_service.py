from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.companies import models, schemas

def create_job_offer(job: schemas.JobOfferCreate, current_user: dict, db: Session):
    if job.company_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="No puedes crear vacantes para otra empresa")
    db_job = models.JobOffer(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    from app.matchmaking.client import trigger_recalcular
    trigger_recalcular(job_offer_id=db_job.id)
    return db_job

def get_job_offers(skip: int, limit: int, current_user: dict, db: Session):
    if current_user["role_id"] == 1: # ADMIN
        return db.query(models.JobOffer).offset(skip).limit(limit).all()
    return db.query(models.JobOffer).filter(models.JobOffer.company_id == current_user["id"]).offset(skip).limit(limit).all()
