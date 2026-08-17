from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.dashboard.controllers.dashboard_controller import router as dashboard_router

import app.graduates.models
import app.auth.models
import app.companies.models

app = FastAPI(
    title="Microservicio Módulo 4: Dashboard Administrativo",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)


@app.get("/")
def health_check():
    return {
        "service": "dashboard",
        "status": "ok"
    }