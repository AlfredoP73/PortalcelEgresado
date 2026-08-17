from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ── Criterios / Pesos ────────────────────────────────────────────────────────
class WeightsBase(BaseModel):
    program_weight: Decimal
    skills_weight: Decimal
    experience_weight: Decimal


class WeightsUpdate(WeightsBase):
    @field_validator("program_weight", "skills_weight", "experience_weight")
    @classmethod
    def peso_valido(cls, v: Decimal) -> Decimal:
        if v < 0 or v > 1:
            raise ValueError("Cada peso debe estar entre 0 y 1")
        return v


class WeightsOut(WeightsBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    updated_at: datetime


# ── Matches ───────────────────────────────────────────────────────────────
class MatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    graduate_id: int
    job_offer_id: int
    score: Decimal
    program_score: Optional[Decimal] = None
    skills_score: Optional[Decimal] = None
    experience_score: Optional[Decimal] = None
    calculated_at: datetime


class RecalcularRequest(BaseModel):
    graduate_id: Optional[int] = None
    job_offer_id: Optional[int] = None


# ── Notificaciones ────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    graduate_id: int
    job_offer_id: int
    score: Decimal
    is_read: bool
    sent_at: datetime


# ── Habilidades requeridas por vacante ───────────────────────────────────
class JobOfferSkillIn(BaseModel):
    skill_id: int
    required_level: Optional[str] = None


class JobOfferSkillOut(JobOfferSkillIn):
    model_config = ConfigDict(from_attributes=True)
    job_offer_id: int
