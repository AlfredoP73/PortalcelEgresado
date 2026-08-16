from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.companies import models, schemas

def create_application(app: schemas.ApplicationCreate, db: Session):
    db_app = models.CandidateApplication(**app.model_dump())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def get_applications_by_job(job_offer_id: int, current_user: dict, db: Session):
    if current_user["role_id"] != 1: # If not Admin, verify company owns this job offer
        job = db.query(models.JobOffer).filter(models.JobOffer.id == job_offer_id, models.JobOffer.company_id == current_user["id"]).first()
        if not job:
            raise HTTPException(status_code=403, detail="No tienes acceso a esta vacante")
    return db.query(models.CandidateApplication).options(joinedload(models.CandidateApplication.graduate)).filter(
        models.CandidateApplication.job_offer_id == job_offer_id
    ).all()

def update_application_status(application_id: int, status_update: schemas.ApplicationUpdateStatus, current_user: dict, db: Session):
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

def get_application_candidate(application_id: int, current_user: dict, db: Session):
    query = db.query(models.CandidateApplication).filter(models.CandidateApplication.id == application_id)
    if current_user["role_id"] != 1:
        query = query.join(models.JobOffer).filter(models.JobOffer.company_id == current_user["id"])
    
    app = query.first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found or unauthorized")
        
    from app.graduates.models import Graduate
    from app.auth.models import User
    candidate = db.query(Graduate).filter(Graduate.user_id == app.graduate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    user = db.query(User).filter(User.id == candidate.user_id).first()
    candidate_dict = {k: v for k, v in candidate.__dict__.items() if not k.startswith('_')}
    candidate_dict['email'] = user.email if user else None
    
    candidate_dict['experiences'] = [{k: v for k, v in exp.__dict__.items() if not k.startswith('_')} for exp in candidate.experiences]
    candidate_dict['academic_histories'] = [{k: v for k, v in edu.__dict__.items() if not k.startswith('_')} for edu in candidate.academic_histories]
    candidate_dict['certifications'] = [{k: v for k, v in cert.__dict__.items() if not k.startswith('_')} for cert in candidate.certifications]
    
    return candidate_dict

def get_talent_pool(db: Session):
    from app.graduates.models import Graduate
    from app.auth.models import User
    
    graduates = db.query(Graduate).all()
    results = []
    for g in graduates:
        user = db.query(User).filter(User.id == g.user_id).first()
        g_dict = {k: v for k, v in g.__dict__.items() if not k.startswith('_')}
        g_dict['email'] = user.email if user else None
        g_dict['experiences'] = [{k: v for k, v in exp.__dict__.items() if not k.startswith('_')} for exp in g.experiences]
        g_dict['academic_histories'] = [{k: v for k, v in edu.__dict__.items() if not k.startswith('_')} for edu in g.academic_histories]
        g_dict['certifications'] = [{k: v for k, v in cert.__dict__.items() if not k.startswith('_')} for cert in g.certifications]
        results.append(g_dict)
        
    return results
