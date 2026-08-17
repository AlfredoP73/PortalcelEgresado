from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.auth.rbac import RoleChecker

from app.dashboard import schemas
from app.dashboard.services import dashboard_service


require_admin = RoleChecker(["ADMIN"])


router = APIRouter(
    prefix="/api",
    tags=["Dashboard Administrativo"],
    dependencies=[Depends(get_current_user)]
)


@router.get(
    "/dashboard",
    response_model=schemas.DashboardResponse,
    dependencies=[Depends(require_admin)]
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return dashboard_service.get_dashboard(db)