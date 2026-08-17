from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.matchmaking import schemas
from app.matchmaking.services import notification_service

router = APIRouter(prefix="/matching/notifications", tags=["Matching - Notificaciones"])


@router.get("/{graduate_id}", response_model=list[schemas.NotificationOut])
def listar_notificaciones(graduate_id: int, solo_no_leidas: bool = False, db: Session = Depends(get_db)):
    return notification_service.get_notifications(db, graduate_id, solo_no_leidas)


@router.patch("/{notification_id}/leido", response_model=schemas.NotificationOut)
def marcar_leida(notification_id: int, db: Session = Depends(get_db)):
    notif = notification_service.marcar_como_leida(db, notification_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return notif
