"""
Motor de Compatibilidad (Matchmaking).

Calcula un score de 0 a 100 entre un egresado y una vacante, combinando
tres criterios ponderados: programa académico, habilidades y experiencia.
Los pesos se leen de matchmaking_weights (configurables desde el CRUD
de criterios, Módulo 3.3).
"""

from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.matchmaking.models import Match, MatchNotification
from app.matchmaking.services.criteria_service import get_weights

# Umbral de compatibilidad a partir del cual se genera una notificación (Módulo 3.2)
UMBRAL_NOTIFICACION = Decimal("75.00")


# ── Lectura de datos de otros dominios (misma BD, distintos microservicios) ──
def _get_graduate_data(db: Session, graduate_id: int) -> Optional[dict]:
    row = db.execute(
        text("SELECT user_id, program_id FROM graduates WHERE user_id = :gid"),
        {"gid": graduate_id},
    ).mappings().first()
    if not row:
        return None

    skills_rows = db.execute(
        text("SELECT skill_id, proficiency_level FROM graduate_skills WHERE graduate_id = :gid"),
        {"gid": graduate_id},
    ).mappings().all()

    exp_rows = db.execute(
        text("SELECT start_date, end_date FROM work_experiences WHERE graduate_id = :gid"),
        {"gid": graduate_id},
    ).mappings().all()

    total_dias = 0
    for exp in exp_rows:
        inicio = exp["start_date"]
        fin = exp["end_date"] or date.today()
        if inicio:
            total_dias += (fin - inicio).days
    total_years = round(total_dias / 365.25, 1) if total_dias > 0 else 0.0

    return {
        "program_id": row["program_id"],
        "skills": {r["skill_id"]: r["proficiency_level"] for r in skills_rows},
        "total_experience_years": total_years,
        "survey": _get_survey_context(db, graduate_id),
    }


# ── Encuesta de seguimiento (M01) ─────────────────────────────────────────────
def _get_survey_context(db: Session, graduate_id: int) -> dict:
    """Extrae respuestas de la última encuesta del egresado (bonus tie-breaker).

    Localiza las preguntas por palabras clave en el texto de la pregunta, así
    el algoritmo no depende de ids fijos. Respuestas conocidas:
      - ¿Se encuentra laborando actualmente?        -> laborando
      - ¿En qué sector económico se desempeña?       -> sector
      - ¿Su empleo actual tiene relación con su programa académico? -> relacion_programa
    """
    resp = db.execute(
        text(
            """SELECT sr.answers_json, s.questions_json
               FROM survey_responses sr
               JOIN surveys s ON s.id = sr.survey_id
               WHERE sr.graduate_id = :gid
               ORDER BY sr.submitted_at DESC
               LIMIT 1"""
        ),
        {"gid": graduate_id},
    ).mappings().first()
    if not resp:
        return {"laborando": None, "sector": None, "relacion_programa": None}

    answers = resp["answers_json"] or {}
    questions = resp["questions_json"] or []
    qid = {}
    for q in questions:
        t = str(q.get("question", "")).lower()
        if "laborando" in t or ("encuentra" in t and "laboral" in t):
            qid["laborando"] = q.get("id")
        elif "sector" in t:
            qid["sector"] = q.get("id")
        elif "relaci" in t and ("programa" in t or "academico" in t or "académico" in t):
            qid["relacion_programa"] = q.get("id")

    return {
        "laborando": answers.get(qid["laborando"]) if qid.get("laborando") else None,
        "sector": answers.get(qid["sector"]) if qid.get("sector") else None,
        "relacion_programa": answers.get(qid["relacion_programa"]) if qid.get("relacion_programa") else None,
    }


def _get_job_offer_data(db: Session, job_offer_id: int) -> Optional[dict]:
    row = db.execute(
        text(
            """SELECT jo.id, jo.program_id, jo.min_experience_years, jo.status,
                      sec.name AS company_sector
               FROM job_offers jo
               JOIN companies co ON co.user_id = jo.company_id
               LEFT JOIN sectors sec ON sec.id = co.sector_id
               WHERE jo.id = :jid"""
        ),
        {"jid": job_offer_id},
    ).mappings().first()
    if not row:
        return None

    skills_rows = db.execute(
        text("SELECT skill_id, required_level FROM job_offer_skills WHERE job_offer_id = :jid"),
        {"jid": job_offer_id},
    ).mappings().all()

    return {
        "program_id": row["program_id"],
        "min_experience_years": row["min_experience_years"] or 0,
        "status": row["status"],
        "company_sector": row["company_sector"],
        "required_skills": {r["skill_id"]: r["required_level"] for r in skills_rows},
    }


# ── Algoritmo puro (fácil de testear unitariamente) ──────────────────────────
def calcular_afinidad(graduate: dict, job_offer: dict, weights: dict) -> dict:
    # 1. Programa académico: match exacto = 100, si no = 0.
    #    NULL nunca es un match: si alguno de los dos no tiene programa, 0.
    g_pid = graduate.get("program_id")
    j_pid = job_offer.get("program_id")
    if g_pid is not None and j_pid is not None and g_pid == j_pid:
        program_score = Decimal("100.00")
    else:
        program_score = Decimal("0.00")

    # 2. Habilidades: porcentaje de las requeridas que el egresado posee (Jaccard sobre lo requerido)
    req_skills = set(job_offer["required_skills"].keys())
    grad_skills = set(graduate["skills"].keys())
    if req_skills:
        skills_score = (Decimal(len(req_skills & grad_skills)) / Decimal(len(req_skills))) * 100
    else:
        skills_score = Decimal("100.00")  # la vacante no exige skills puntuales -> no penaliza

    # 3. Experiencia: escala progresiva, no todo-o-nada
    min_exp = job_offer["min_experience_years"] or 0
    if min_exp == 0:
        experience_score = Decimal("100.00")
    else:
        ratio = min(Decimal(str(graduate["total_experience_years"])) / Decimal(min_exp), Decimal("1.0"))
        experience_score = ratio * 100

    final_score = (
        program_score * Decimal(str(weights["program_weight"]))
        + skills_score * Decimal(str(weights["skills_weight"]))
        + experience_score * Decimal(str(weights["experience_weight"]))
    )

    # Bonus (tie-breaker) por encuesta de seguimiento: ajusta ±pocos puntos
    survey_bonus = _bonus_encuesta(graduate, job_offer)
    final_score = min(final_score + survey_bonus, Decimal("100.00"))

    return {
        "score": round(final_score, 2),
        "program_score": round(program_score, 2),
        "skills_score": round(skills_score, 2),
        "experience_score": round(experience_score, 2),
        "survey_bonus": round(survey_bonus, 2),
    }


def _bonus_encuesta(graduate: dict, job_offer: dict) -> Decimal:
    """Puntos de afinidad extra derivados de la Encuesta de Seguimiento (M01).

    Reglas (bonus acumulable, máx ~12 puntos):
      +4  el egresado NO está laborando (disponible para la vacante)
      +3  su empleo está totalmente relacionado con su programa académico
      +1.5 el empleo tiene relación parcial con su programa
      +5  el sector donde se desempeña coincide con el de la empresa de la vacante
    """
    survey = graduate.get("survey") or {}
    bonus = Decimal("0.00")

    laborando = str(survey.get("laborando") or "").strip().lower()
    if laborando.startswith("no"):
        bonus += Decimal("4.00")

    relacion = str(survey.get("relacion_programa") or "").strip().lower()
    if "total" in relacion or relacion == "sí" or relacion == "si":
        bonus += Decimal("3.00")
    elif "parcial" in relacion:
        bonus += Decimal("1.50")

    sector = str(survey.get("sector") or "").strip().lower()
    company_sector = str(job_offer.get("company_sector") or "").strip().lower()
    if sector and company_sector and (sector in company_sector or company_sector in sector):
        bonus += Decimal("5.00")

    return bonus


# ── Persistencia + notificaciones ────────────────────────────────────────────
def _upsert_match(db: Session, graduate_id: int, job_offer_id: int, result: dict) -> Match:
    existing = db.query(Match).filter_by(graduate_id=graduate_id, job_offer_id=job_offer_id).first()
    if existing:
        existing.score = result["score"]
        existing.program_score = result["program_score"]
        existing.skills_score = result["skills_score"]
        existing.experience_score = result["experience_score"]
        match = existing
    else:
        match = Match(
            graduate_id=graduate_id,
            job_offer_id=job_offer_id,
            score=result["score"],
            program_score=result["program_score"],
            skills_score=result["skills_score"],
            experience_score=result["experience_score"],
        )
        db.add(match)
    db.commit()
    db.refresh(match)

    if result["score"] >= UMBRAL_NOTIFICACION:
        ya_notificado = (
            db.query(MatchNotification)
            .filter_by(graduate_id=graduate_id, job_offer_id=job_offer_id)
            .first()
        )
        if not ya_notificado:
            db.add(
                MatchNotification(
                    graduate_id=graduate_id,
                    job_offer_id=job_offer_id,
                    score=result["score"],
                )
            )
            db.commit()

    return match


# ── Funciones públicas usadas por los controllers ────────────────────────────
def calcular_match_individual(db: Session, graduate_id: int, job_offer_id: int) -> Optional[Match]:
    graduate = _get_graduate_data(db, graduate_id)
    job_offer = _get_job_offer_data(db, job_offer_id)
    if not graduate or not job_offer:
        return None

    weights = get_weights(db)
    result = calcular_afinidad(graduate, job_offer, weights)
    return _upsert_match(db, graduate_id, job_offer_id, result)


def recalcular_por_egresado(db: Session, graduate_id: int) -> list[Match]:
    """Se dispara cuando el egresado actualiza su perfil/hoja de vida."""
    job_offer_ids = [
        r["id"]
        for r in db.execute(text("SELECT id FROM job_offers WHERE status = 'ACTIVE'")).mappings().all()
    ]
    resultados = []
    for jid in job_offer_ids:
        m = calcular_match_individual(db, graduate_id, jid)
        if m:
            resultados.append(m)
    return resultados


def recalcular_por_vacante(db: Session, job_offer_id: int) -> list[Match]:
    """Se dispara cuando la empresa publica o edita una vacante."""
    graduate_ids = [r["user_id"] for r in db.execute(text("SELECT user_id FROM graduates")).mappings().all()]
    resultados = []
    for gid in graduate_ids:
        m = calcular_match_individual(db, gid, job_offer_id)
        if m:
            resultados.append(m)
    return resultados


def obtener_vacantes_recomendadas(db: Session, graduate_id: int, limit: int = 10) -> list[Match]:
    return (
        db.query(Match)
        .filter(Match.graduate_id == graduate_id)
        .order_by(Match.score.desc())
        .limit(limit)
        .all()
    )


def obtener_candidatos_recomendados(db: Session, job_offer_id: int, limit: int = 10) -> list[Match]:
    return (
        db.query(Match)
        .filter(Match.job_offer_id == job_offer_id)
        .order_by(Match.score.desc())
        .limit(limit)
        .all()
    )
