from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.matchmaking import schemas
from app.matchmaking.deps import require_admin
from app.matchmaking.services import criteria_service
from app.auth.utils.auth_utils import get_current_user

router = APIRouter(prefix="/matching/criteria", tags=["Matching - Criterios"])


@router.get("", response_model=schemas.WeightsBase, dependencies=[Depends(get_current_user)])
def ver_criterios(db: Session = Depends(get_db)):
    return criteria_service.get_weights(db)


@router.put("", response_model=schemas.WeightsOut, dependencies=[Depends(require_admin)])
def actualizar_criterios(data: schemas.WeightsUpdate, db: Session = Depends(get_db)):
    """
    Actualiza los pesos del algoritmo (ej. mayor peso a experiencia, carrera o
    habilidades). La suma de los tres pesos debe ser 1.00 (100%).
    """
    try:
        return criteria_service.update_weights(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))