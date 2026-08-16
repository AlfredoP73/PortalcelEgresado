from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class WorkExperienceBase(BaseModel):
    company_name: str
    position: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None

class WorkExperienceCreate(WorkExperienceBase):
    pass

class WorkExperience(WorkExperienceBase):
    id: int
    graduate_id: int
    certificate_url: Optional[str] = None

    class Config:
        from_attributes = True

class AcademicHistoryBase(BaseModel):
    institution: str
    degree: str
    start_date: date
    end_date: Optional[date] = None

class AcademicHistoryCreate(AcademicHistoryBase):
    pass

class AcademicHistory(AcademicHistoryBase):
    id: int
    graduate_id: int
    diploma_url: Optional[str] = None

    class Config:
        from_attributes = True

class CertificationBase(BaseModel):
    name: str
    issuing_organization: str
    issue_date: date

class CertificationCreate(CertificationBase):
    pass

class Certification(CertificationBase):
    id: int
    class Config:
        from_attributes = True

class GraduateBase(BaseModel):
    first_name: str
    last_name: str
    program_id: int
    graduation_year: int
    phone: Optional[str] = None
    cv_url: Optional[str] = None
    profile_summary: Optional[str] = None

class GraduateCreate(GraduateBase):
    user_id: Optional[int] = None

class Graduate(GraduateBase):
    user_id: int
    experiences: List[WorkExperience] = []
    academic_histories: List[AcademicHistory] = []
    certifications: List[Certification] = []

    class Config:
        from_attributes = True

# For Job Board (Read-Only Views)
class SectorMinimal(BaseModel):
    name: str
    class Config:
        from_attributes = True

class CityMinimal(BaseModel):
    name: str
    class Config:
        from_attributes = True

class CompanyFull(BaseModel):
    name: str
    sector: Optional[SectorMinimal] = None
    city: Optional[CityMinimal] = None
    class Config:
        from_attributes = True

class JobOffer(BaseModel):
    id: int
    title: str
    description: str
    requirements: str
    functions: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    program_id: int
    closing_date: date
    status: str
    company: CompanyFull
    
    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    job_offer_id: int

class Application(BaseModel):
    id: int
    job_offer_id: int
    graduate_id: int
    application_date: datetime
    status: str
    job_offer: Optional[JobOffer] = None

    class Config:
        from_attributes = True

class AdminGraduateCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    program_id: int
    graduation_year: int
    phone: Optional[str] = None

class SurveyBase(BaseModel):
    title: str
    description: Optional[str] = None
    questions_json: list
    is_active: bool = True

class Survey(SurveyBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SurveyResponseCreate(BaseModel):
    survey_id: int
    answers_json: dict

class SurveyResponse(SurveyResponseCreate):
    id: int
    graduate_id: int
    submitted_at: datetime

    class Config:
        from_attributes = True
