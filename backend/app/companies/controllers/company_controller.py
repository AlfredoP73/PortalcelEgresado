from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.auth.rbac import RoleChecker
from app.companies import schemas
from app.companies.services import company_service

require_admin = RoleChecker(["ADMIN"])
require_admin_or_company = RoleChecker(["ADMIN", "COMPANY"])

router = APIRouter(
    prefix="/api/modulo2",
    tags=["Empresas"],
    dependencies=[Depends(get_current_user)]
)

@router.post("/companies", response_model=schemas.Company, dependencies=[Depends(require_admin_or_company)])
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return company_service.create_company(company, current_user, db)

@router.get("/companies", response_model=List[schemas.Company], dependencies=[Depends(require_admin_or_company)])
def get_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return company_service.get_companies(skip, limit, current_user, db)

@router.put("/companies/{company_id}/status", response_model=schemas.Company, dependencies=[Depends(require_admin)])
def update_company_status(company_id: int, status_update: schemas.CompanyUpdateStatus, db: Session = Depends(get_db)):
    return company_service.update_company_status(company_id, status_update, db)

@router.put("/companies/{company_id}", response_model=schemas.Company, dependencies=[Depends(require_admin)])
def update_company(company_id: int, company_update: schemas.CompanyCreate, db: Session = Depends(get_db)):
    return company_service.update_company(company_id, company_update, db)

@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_company(company_id: int, db: Session = Depends(get_db)):
    return company_service.delete_company(company_id, db)
