from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.graduates.controllers.graduate_controller import router as graduate_router
from app.graduates.controllers.experience_controller import router as experience_router
from app.graduates.controllers.education_controller import router as education_router
from app.graduates.controllers.misc_controller import router as misc_router
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

app.include_router(graduate_router)
app.include_router(experience_router)
app.include_router(education_router)
app.include_router(misc_router)

os.makedirs("uploads/cvs", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def health_check():
    return {"service": "graduates", "status": "ok"}
