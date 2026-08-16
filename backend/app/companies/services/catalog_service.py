from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.companies import models, schemas

def get_sectors(db: Session):
    return db.query(models.Sector).all()

def create_sector(sector: schemas.SectorCreate, db: Session):
    db_sector = models.Sector(**sector.model_dump())
    db.add(db_sector)
    db.commit()
    db.refresh(db_sector)
    return db_sector

def delete_sector(sector_id: int, db: Session):
    db_sector = db.query(models.Sector).filter(models.Sector.id == sector_id).first()
    if not db_sector:
        raise HTTPException(status_code=404, detail="Sector not found")
    db.delete(db_sector)
    db.commit()
    return {"detail": "Deleted"}

def get_cities(db: Session):
    return db.query(models.City).all()

def create_city(city: schemas.CityCreate, db: Session):
    db_city = models.City(**city.model_dump())
    db.add(db_city)
    db.commit()
    db.refresh(db_city)
    return db_city

def delete_city(city_id: int, db: Session):
    db_city = db.query(models.City).filter(models.City.id == city_id).first()
    if not db_city:
        raise HTTPException(status_code=404, detail="City not found")
    db.delete(db_city)
    db.commit()
    return {"detail": "Deleted"}

def get_programs(db: Session):
    return db.query(models.Program).all()

def create_program(program: schemas.ProgramCreate, db: Session):
    db_program = models.Program(**program.model_dump())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program

def delete_program(program_id: int, db: Session):
    db_program = db.query(models.Program).filter(models.Program.id == program_id).first()
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
    db.delete(db_program)
    db.commit()
    return {"detail": "Deleted"}
