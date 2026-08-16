from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.companies.routes import router
import app.companies.models
import app.auth.models  # Register User/Role models so FK to users.id resolves

app = FastAPI(
    title="Microservicio Módulo 2: Empresas y Vacantes",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def health_check():
    return {"service": "companies", "status": "ok"}