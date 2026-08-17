from pydantic import BaseModel
from typing import List


class DashboardSummary(BaseModel):
    total_graduates: int
    employment_rate: float
    average_salary: float
    average_time_to_first_job: float


class EmploymentByProgram(BaseModel):
    program: str
    percentage: float


class IndustryMetric(BaseModel):
    sector: str
    percentage: float


class SalaryByProgram(BaseModel):
    program: str
    average_salary: float


class ApplicationStatusMetric(BaseModel):
    status: str
    count: int


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    employment_by_program: List[EmploymentByProgram]
    industries: List[IndustryMetric]
    salary_by_program: List[SalaryByProgram]
    application_status: List[ApplicationStatusMetric]

class TimelineMetric(BaseModel):
    date: str
    count: int

class SkillRadarMetric(BaseModel):
    skill: str
    graduate: int
    market: int

class ProgramApplicantMetric(BaseModel):
    program: str
    count: int

class FrequentSkillMetric(BaseModel):
    skill: str
    count: int

class MarketSalaryMetric(BaseModel):
    range: str
    count: int

class CompanyDashboardSummary(BaseModel):
    active_offers: int
    total_applicants: int
    hired_candidates: int
    average_hiring_time_days: int
    conversion_rate: float
    visits_to_offers: int

class CompanyDashboardResponse(BaseModel):
    summary: CompanyDashboardSummary
    applications_by_status: List[ApplicationStatusMetric]
    hiring_funnel: List[ApplicationStatusMetric]
    applicants_by_program: List[ProgramApplicantMetric]
    applications_timeline: List[TimelineMetric]
    frequent_skills: List[FrequentSkillMetric]

class GraduateDashboardSummary(BaseModel):
    total_applications: int
    interviews: int
    offers_viewed: int
    program_average_salary: float
    response_rate: float
    expected_salary: float
    profile_views: int

class GraduateDashboardResponse(BaseModel):
    summary: GraduateDashboardSummary
    applications_by_status: List[ApplicationStatusMetric]
    skills_radar: List[SkillRadarMetric]
    applications_timeline: List[TimelineMetric]
    market_salaries: List[MarketSalaryMetric]