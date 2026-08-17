from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.matchmaking.controllers import (
    criteria_controller,
    match_controller,
    notification_controller,
)

app = FastAPI(
    title="Microservicio de Matchmaking - Portal del Egresado",
    description=(
        "Motor de compatibilidad egresado-vacante (Módulo 3): calcula el "
        "porcentaje de afinidad, gestiona los criterios/ponderaciones del "
        "algoritmo y dispara alertas de alta compatibilidad."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restringir a los orígenes del frontend en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(match_controller.router)
app.include_router(criteria_controller.router)
app.include_router(notification_controller.router)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "matchmaking"}
