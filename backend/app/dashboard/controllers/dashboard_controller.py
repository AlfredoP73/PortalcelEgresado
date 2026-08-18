from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.utils.auth_utils import get_current_user
from app.auth.rbac import RBACProxy

from app.dashboard import schemas
from app.dashboard.services.dashboard_facade import DashboardFacade


require_admin = RBACProxy(["ADMIN"])
require_company = RBACProxy(["COMPANY"])
require_graduate = RBACProxy(["GRADUATE"])

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
    program_id: int = Query(None),
    year: int = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    facade = DashboardFacade(db)
    return facade.get_admin_dashboard(program_id, year)

@router.get(
    "/company/dashboard",
    response_model=schemas.CompanyDashboardResponse,
    dependencies=[Depends(require_company)]
)
def get_company_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    facade = DashboardFacade(db)
    return facade.get_company_dashboard(current_user["id"])

@router.get(
    "/graduate/dashboard",
    response_model=schemas.GraduateDashboardResponse,
    dependencies=[Depends(require_graduate)]
)
def get_graduate_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    facade = DashboardFacade(db)
    return facade.get_graduate_dashboard(current_user["id"])