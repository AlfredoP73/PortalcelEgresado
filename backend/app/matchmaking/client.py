"""
Cliente HTTP para disparar el recálculo del matchmaking (Módulo 3).

Los microservicios companies y graduates lo usan después de crear/editar
una vacante o actualizar el perfil de un egresado, para que el motor de
compatibilidad recalcule las afinidades afectadas.
"""

import os
from typing import Optional

import httpx

MATCHMAKING_URL = os.getenv("MATCHMAKING_URL", "http://matchmaking:8000")
INTERNAL_TOKEN = os.getenv("MATCHMAKING_INTERNAL_TOKEN", "token_interno_servicios")


def trigger_recalcular(
    graduate_id: Optional[int] = None,
    job_offer_id: Optional[int] = None,
    timeout: float = 10.0,
) -> bool:
    """Dispara POST /matching/recalcular. Nunca lanza; devuelve éxito booleano."""
    payload: dict = {}
    if graduate_id is not None:
        payload["graduate_id"] = graduate_id
    if job_offer_id is not None:
        payload["job_offer_id"] = job_offer_id
    if not payload:
        return False

    try:
        resp = httpx.post(
            f"{MATCHMAKING_URL}/matching/recalcular",
            json=payload,
            headers={"X-Internal-Token": INTERNAL_TOKEN},
            timeout=timeout,
        )
        resp.raise_for_status()
        return True
    except httpx.HTTPError:
        # No debe romper el flujo principal si el matchmaking no está disponible.
        return False