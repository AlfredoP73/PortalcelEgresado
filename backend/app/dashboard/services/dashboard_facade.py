from sqlalchemy.orm import Session
from app.dashboard.services import dashboard_service

class DashboardFacade:
    """
    Facade for the Dashboard module.
    Provides a simplified interface to gather metrics from various underlying services and repositories.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_admin_dashboard(self, program_id: int = None, year: int = None):
        return dashboard_service.get_dashboard(self.db, program_id, year)

    def get_company_dashboard(self, company_id: int):
        return dashboard_service.get_company_dashboard(self.db, company_id)

    def get_graduate_dashboard(self, graduate_id: int):
        return dashboard_service.get_graduate_dashboard(self.db, graduate_id)
