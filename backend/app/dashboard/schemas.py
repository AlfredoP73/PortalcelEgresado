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