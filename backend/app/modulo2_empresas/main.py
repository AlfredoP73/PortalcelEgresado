from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.modulo2_empresas.routes import router

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Microservicio Módulo 2: Empresas y Vacantes", version="1.0.0")

# Setup CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido al Microservicio del Módulo 2 (Empresas)"}
