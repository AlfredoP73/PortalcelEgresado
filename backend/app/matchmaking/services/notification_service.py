from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.matchmaking.models import MatchNotification


def get_notifications(db: Session, graduate_id: int, solo_no_leidas: bool = False) -> list[dict]:
    """Lista notificaciones de afinidad enriquecidas con título de vacante y empresa."""
    sql = """
        SELECT mn.id, mn.graduate_id, mn.job_offer_id, mn.score, mn.is_read, mn.sent_at,
               jo.title AS job_title,
               co.name AS company_name
        FROM match_notifications mn
        JOIN job_offers jo ON jo.id = mn.job_offer_id
        JOIN companies co ON co.user_id = jo.company_id
        WHERE mn.graduate_id = :gid
    """
    if solo_no_leidas:
        sql += " AND mn.is_read = FALSE"
    sql += " ORDER BY mn.sent_at DESC"

    rows = db.execute(text(sql), {"gid": graduate_id}).mappings().all()
    return [dict(r) for r in rows]


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
