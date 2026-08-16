from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.auth.rbac import RoleChecker
from app.companies import schemas
from app.companies.services import job_offer_service

require_company = RoleChecker(["COMPANY"])
require_admin_or_company = RoleChecker(["ADMIN", "COMPANY"])

router = APIRouter(
    prefix="/api/modulo2",
    tags=["Vacantes"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/jobs", response_model=schemas.JobOffer, dependencies=[Depends(require_company)])
def create_job_offer(job: schemas.JobOfferCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return job_offer_service.create_job_offer(job, current_user, db)

@router.get("/jobs", response_model=List[schemas.JobOffer], dependencies=[Depends(require_admin_or_company)])
def get_job_offers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return job_offer_service.get_job_offers(skip, limit, current_user, db)
