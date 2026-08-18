from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.companies import models, schemas

def create_job_offer(job: schemas.JobOfferCreate, current_user: dict, db: Session):
    if job.company_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="No puedes crear vacantes para otra empresa")
    
    # Extraemos required_skills para no pasarlas directamente al modelo JobOffer
    job_data = job.model_dump(exclude={"required_skills"})
    db_job = models.JobOffer(**job_data)
    db.add(db_job)
    db.flush() # Para obtener el ID del job_offer

    # Agregamos las skills requeridas
    for skill in job.required_skills:
        db_skill = models.JobOfferSkill(
            job_offer_id=db_job.id,
            skill_id=skill.skill_id,
            required_level=skill.required_level
        )
        db.add(db_skill)

    db.commit()
    db.refresh(db_job)
    from app.matchmaking.client import trigger_recalcular
    trigger_recalcular(job_offer_id=db_job.id)
    return db_job

def get_job_offers(skip: int, limit: int, current_user: dict, db: Session):
    if current_user["role_id"] == 1: # ADMIN
        return db.query(models.JobOffer).offset(skip).limit(limit).all()
    return db.query(models.JobOffer).filter(models.JobOffer.company_id == current_user["id"]).offset(skip).limit(limit).all()
