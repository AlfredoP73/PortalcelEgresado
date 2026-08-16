from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import router
import app.auth.models  # noqa: F401 — registra los modelos en Base

app = FastAPI(
    title="Microservicio de Autenticación",
    description="Maneja login, registro y validación de tokens JWT",
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
    return {"service": "auth", "status": "ok"}