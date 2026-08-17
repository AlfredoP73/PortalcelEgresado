from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.auth.rbac import RoleChecker
from app.companies import schemas
from app.companies.services import catalog_service

require_admin = RoleChecker(["ADMIN"])

router = APIRouter(
    prefix="/api/modulo2",
    tags=["Catálogos"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/sectors", response_model=List[schemas.Sector])
def get_sectors(db: Session = Depends(get_db)):
    return catalog_service.get_sectors(db)

@router.post("/sectors", response_model=schemas.Sector, dependencies=[Depends(require_admin)])
def create_sector(sector: schemas.SectorCreate, db: Session = Depends(get_db)):
    return catalog_service.create_sector(sector, db)

@router.put("/sectors/{sector_id}", response_model=schemas.Sector, dependencies=[Depends(require_admin)])
def update_sector(sector_id: int, sector: schemas.SectorUpdate, db: Session = Depends(get_db)):
    return catalog_service.update_sector(sector_id, sector, db)

@router.delete("/sectors/{sector_id}", dependencies=[Depends(require_admin)])
def delete_sector(sector_id: int, db: Session = Depends(get_db)):
    return catalog_service.delete_sector(sector_id, db)

@router.get("/cities", response_model=List[schemas.City])
def get_cities(db: Session = Depends(get_db)):
    return catalog_service.get_cities(db)

@router.post("/cities", response_model=schemas.City, dependencies=[Depends(require_admin)])
def create_city(city: schemas.CityCreate, db: Session = Depends(get_db)):
    return catalog_service.create_city(city, db)

@router.put("/cities/{city_id}", response_model=schemas.City, dependencies=[Depends(require_admin)])
def update_city(city_id: int, city: schemas.CityUpdate, db: Session = Depends(get_db)):
    return catalog_service.update_city(city_id, city, db)

@router.delete("/cities/{city_id}", dependencies=[Depends(require_admin)])
def delete_city(city_id: int, db: Session = Depends(get_db)):
    return catalog_service.delete_city(city_id, db)

@router.get("/programs", response_model=List[schemas.Program])
def get_programs(db: Session = Depends(get_db)):
    return catalog_service.get_programs(db)

@router.post("/programs", response_model=schemas.Program, dependencies=[Depends(require_admin)])
def create_program(program: schemas.ProgramCreate, db: Session = Depends(get_db)):
    return catalog_service.create_program(program, db)

@router.put("/programs/{program_id}", response_model=schemas.Program, dependencies=[Depends(require_admin)])
def update_program(program_id: int, program: schemas.ProgramUpdate, db: Session = Depends(get_db)):
    return catalog_service.update_program(program_id, program, db)

@router.delete("/programs/{program_id}", dependencies=[Depends(require_admin)])
def delete_program(program_id: int, db: Session = Depends(get_db)):
    return catalog_service.delete_program(program_id, db)
