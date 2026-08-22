from fastapi import APIRouter

internal_router = APIRouter(
    prefix="/api/internal",
    tags=["Internal APIs"]
)
