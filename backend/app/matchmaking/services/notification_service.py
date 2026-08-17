from typing import Optional

from sqlalchemy.orm import Session

from app.matchmaking.models import MatchNotification


def get_notifications(db: Session, graduate_id: int, solo_no_leidas: bool = False) -> list[MatchNotification]:
    query = db.query(MatchNotification).filter(MatchNotification.graduate_id == graduate_id)
    if solo_no_leidas:
        query = query.filter(MatchNotification.is_read.is_(False))
    return query.order_by(MatchNotification.sent_at.desc()).all()


def get_notification(db: Session, notification_id: int) -> Optional[MatchNotification]:
    return db.query(MatchNotification).filter(MatchNotification.id == notification_id).first()


def marcar_como_leida(db: Session, notification_id: int) -> Optional[MatchNotification]:
    notif = db.query(MatchNotification).filter(MatchNotification.id == notification_id).first()
    if not notif:
        return None
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
