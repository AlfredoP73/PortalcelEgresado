from decimal import Decimal

from sqlalchemy.orm import Session

from app.matchmaking.models import MatchmakingWeight
from app.matchmaking.schemas import WeightsUpdate


def get_weights(db: Session) -> dict:
    """Devuelve el registro de pesos más reciente; crea uno por defecto si no existe."""
    weights = db.query(MatchmakingWeight).order_by(MatchmakingWeight.id.desc()).first()
    if not weights:
        weights = MatchmakingWeight(program_weight=Decimal("0.40"), skills_weight=Decimal("0.40"), experience_weight=Decimal("0.20"))
        db.add(weights)
        db.commit()
        db.refresh(weights)
    return {
        "program_weight": weights.program_weight,
        "skills_weight": weights.skills_weight,
        "experience_weight": weights.experience_weight,
    }


def update_weights(db: Session, data: WeightsUpdate) -> MatchmakingWeight:
    total = data.program_weight + data.skills_weight + data.experience_weight
    if abs(total - Decimal("1.00")) > Decimal("0.01"):
        raise ValueError(f"Los pesos deben sumar 1.00 (100%). Suma actual: {total}")

    weights = db.query(MatchmakingWeight).order_by(MatchmakingWeight.id.desc()).first()
    if not weights:
        weights = MatchmakingWeight()
        db.add(weights)

    weights.program_weight = data.program_weight
    weights.skills_weight = data.skills_weight
    weights.experience_weight = data.experience_weight
    db.commit()
    db.refresh(weights)
    return weights
