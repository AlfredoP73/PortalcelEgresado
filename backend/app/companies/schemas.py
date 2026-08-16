from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date, datetime
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

class ProgramBase(BaseModel):
    name: str

class ProgramCreate(ProgramBase):
    pass

class Program(ProgramBase):
    id: int
    class Config:
        from_attributes = True

# --- Company ---
class CompanyBase(BaseModel):
    user_id: Optional[int] = None
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
    user_id: int
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
    program_id: int
    closing_date: date

class JobOfferCreate(JobOfferBase):
    pass

class JobOffer(JobOfferBase):
    id: int
    status: JobOfferStatus
    company: Company
    program: Program

    class Config:
        from_attributes = True

# --- Application ---
class ApplicationBase(BaseModel):
    job_offer_id: int
    graduate_id: int
    application_date: datetime

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdateStatus(BaseModel):
    status: ApplicationStatus

class Application(ApplicationBase):
    id: int
    status: ApplicationStatus
    
    class Config:
        from_attributes = True

class GraduateBasicInfo(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    program_id: int
    graduation_year: int
    
    class Config:
        from_attributes = True

class ApplicationWithCandidate(Application):
    graduate: GraduateBasicInfo
    
    class Config:
        from_attributes = True

class GraduateWithContact(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    program_id: int
    graduation_year: int
    phone: Optional[str] = None
    email: Optional[str] = None
    cv_url: Optional[str] = None
    profile_summary: Optional[str] = None
    experiences: List[Any] = []
    academic_histories: List[Any] = []
    certifications: List[Any] = []
    
    class Config:
        from_attributes = True
