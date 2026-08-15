from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from .models import CompanyStatus, JobOfferStatus, ApplicationStatus

# --- Catalogs ---
class SectorBase(BaseModel):
    name: str

class SectorCreate(SectorBase):
    pass

class Sector(SectorBase):
    id: int
    class Config:
        from_attributes = True

class CityBase(BaseModel):
    name: str

class CityCreate(CityBase):
    pass

class City(CityBase):
    id: int
    class Config:
        from_attributes = True

class CareerBase(BaseModel):
    name: str

class CareerCreate(CareerBase):
    pass

class Career(CareerBase):
    id: int
    class Config:
        from_attributes = True

# --- Company ---
class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None
    contact_email: str
    sector_id: int
    city_id: int

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdateStatus(BaseModel):
    status: CompanyStatus

class Company(CompanyBase):
    id: int
    status: CompanyStatus
    sector: Sector
    city: City

    class Config:
        from_attributes = True

# --- Job Offer ---
class JobOfferBase(BaseModel):
    company_id: int
    title: str
    description: str
    requirements: str
    functions: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    career_id: int
    closing_date: date

class JobOfferCreate(JobOfferBase):
    pass

class JobOffer(JobOfferBase):
    id: int
    status: JobOfferStatus
    company: Company
    career: Career

    class Config:
        from_attributes = True

# --- Application ---
class ApplicationBase(BaseModel):
    job_offer_id: int
    candidate_id: int
    application_date: date

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdateStatus(BaseModel):
    status: ApplicationStatus

class Application(ApplicationBase):
    id: int
    status: ApplicationStatus
    
    class Config:
        from_attributes = True
