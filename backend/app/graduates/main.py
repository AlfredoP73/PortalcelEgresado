from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.graduates.routes import router
import app.graduates.models
import app.auth.models
import app.companies.models

app = FastAPI(
    title="Microservicio Módulo 1: Egresados",
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

os.makedirs("uploads/cvs", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def health_check():
    return {"service": "graduates", "status": "ok"}
