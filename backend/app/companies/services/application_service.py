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
    
    applications = db.query(models.CandidateApplication).filter(
        models.CandidateApplication.job_offer_id == job_offer_id
    ).all()
    
    import httpx
    try:
        response = httpx.get("http://graduates:8000/api/internal/graduates", timeout=5.0)
        response.raise_for_status()
        all_graduates = {g["user_id"]: g for g in response.json()}
    except Exception as e:
        print(f"Error fetching graduates data: {e}")
        all_graduates = {}
        
    result = []
    for app in applications:
        app_dict = {k: v for k, v in app.__dict__.items() if not k.startswith('_')}
        app_dict["graduate"] = all_graduates.get(app.graduate_id)
        result.append(app_dict)
        
    return result

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
        
    import httpx
    try:
        response = httpx.get(f"http://graduates:8000/api/internal/graduates/{app.graduate_id}", timeout=5.0)
        response.raise_for_status()
        candidate_dict = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching candidate data: {str(e)}")
    
    return candidate_dict

def get_talent_pool(db: Session):
    import httpx
    try:
        response = httpx.get("http://graduates:8000/api/internal/graduates", timeout=5.0)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # Si falla la comunicación, podemos devolver una lista vacía o levantar error
        return []
