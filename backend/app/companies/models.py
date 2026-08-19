from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.database import Base
from app.graduates.models import Graduate

# --- Enums ---
class CompanyStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class JobOfferStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"

class ApplicationStatus(str, enum.Enum):
    POSTULADO = "POSTULADO"
    EN_EVALUACION = "EN_EVALUACION"
    ENTREVISTADO = "ENTREVISTADO"
    CONTRATADO = "CONTRATADO"

# --- Tablas Catálogo (3FN) ---
class Sector(Base):
    __tablename__ = "sectors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    companies = relationship("Company", back_populates="sector")

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    companies = relationship("Company", back_populates="city")

class Program(Base):
    __tablename__ = "programs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    job_offers = relationship("JobOffer", back_populates="program")

class JobOfferSkill(Base):
    __tablename__ = "job_offer_skills"
    __table_args__ = {'extend_existing': True}
    job_offer_id = Column(Integer, ForeignKey("job_offers.id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(Integer, primary_key=True)
    required_level = Column(String)

# --- Tablas Principales Módulo 2 ---
class Company(Base):
    __tablename__ = "companies"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    contact_email = Column(String, nullable=False)
    sector_id = Column(Integer, ForeignKey("sectors.id"), nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    status = Column(Enum(CompanyStatus), default=CompanyStatus.PENDING)

    sector = relationship("Sector", back_populates="companies")
    city = relationship("City", back_populates="companies")
    job_offers = relationship("JobOffer", back_populates="company")

class JobOffer(Base):
    __tablename__ = "job_offers"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.user_id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    functions = Column(Text, nullable=False)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    min_experience_years = Column(Integer, default=0)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    closing_date = Column(Date, nullable=False)
    status = Column(Enum(JobOfferStatus), default=JobOfferStatus.ACTIVE)

    company = relationship("Company", back_populates="job_offers")
    program = relationship("Program", back_populates="job_offers")
    applications = relationship("CandidateApplication", back_populates="job_offer")
    skills = relationship("JobOfferSkill", cascade="all, delete-orphan")

class CandidateApplication(Base):
    __tablename__ = "applications"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    job_offer_id = Column(Integer, ForeignKey("job_offers.id"), nullable=False)
    graduate_id = Column(Integer, ForeignKey("graduates.user_id"), nullable=False) # Refers to Module 1
    application_date = Column(DateTime, nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.POSTULADO)

    job_offer = relationship("JobOffer", back_populates="applications")
    graduate = relationship("Graduate")
