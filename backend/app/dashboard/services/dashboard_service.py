from sqlalchemy.orm import Session
from sqlalchemy import func

from app.graduates.models import Graduate, WorkExperience
from app.companies.models import (
    Program,
    Sector,
    Company,
    JobOffer,
    CandidateApplication,
    ApplicationStatus,
)


def get_dashboard(db: Session):
    """
    Obtiene las métricas principales del dashboard administrativo.

    No crea ni modifica datos.
    Solamente consulta las tablas existentes de los módulos
    de egresados y empresas.
    """

    # ==========================================================
    # 1. TOTAL DE EGRESADOS
    # ==========================================================

    total_graduates = (
        db.query(func.count(Graduate.user_id))
        .scalar()
        or 0
    )

    # ==========================================================
    # 2. EGRESADOS CONTRATADOS
    # ==========================================================

    contracted_graduates = (
        db.query(
            func.count(
                func.distinct(
                    CandidateApplication.graduate_id
                )
            )
        )
        .filter(
            CandidateApplication.status
            == ApplicationStatus.CONTRATADO
        )
        .scalar()
        or 0
    )

    employment_rate = (
        (contracted_graduates / total_graduates) * 100
        if total_graduates > 0
        else 0
    )

    # ==========================================================
    # 3. TIEMPO PROMEDIO PARA CONSEGUIR EL PRIMER EMPLEO
    # ==========================================================

    graduates_with_experience = (
        db.query(
            Graduate,
            func.min(
                WorkExperience.start_date
            ).label("first_job_date")
        )
        .join(
            WorkExperience,
            WorkExperience.graduate_id
            == Graduate.user_id
        )
        .group_by(
            Graduate.user_id
        )
        .all()
    )

    total_months = 0
    experience_count = 0

    for graduate, first_job_date in graduates_with_experience:

        if not first_job_date:
            continue

        months = (
            (first_job_date.year - graduate.graduation_year)
            * 12
            + (first_job_date.month - 1)
        )

        if months >= 0:
            total_months += months
            experience_count += 1

    average_time_to_first_job = (
        total_months / experience_count
        if experience_count > 0
        else 0
    )

    # ==========================================================
    # 4. SALARIO PROMEDIO
    # ==========================================================

    salary_rows = (
        db.query(
            JobOffer.salary_min,
            JobOffer.salary_max
        )
        .join(
            CandidateApplication,
            CandidateApplication.job_offer_id
            == JobOffer.id
        )
        .filter(
            CandidateApplication.status
            == ApplicationStatus.CONTRATADO,
            JobOffer.salary_min.isnot(None),
            JobOffer.salary_max.isnot(None)
        )
        .all()
    )

    salaries = []

    for salary_min, salary_max in salary_rows:

        salary = (
            salary_min + salary_max
        ) / 2

        salaries.append(salary)

    average_salary = (
        sum(salaries) / len(salaries)
        if salaries
        else 0
    )

    # ==========================================================
    # 5. EMPLEABILIDAD POR PROGRAMA
    # ==========================================================

    program_rows = (
        db.query(
            Program.id,
            Program.name,
            func.count(
                func.distinct(
                    Graduate.user_id
                )
            ).label("total_graduates")
        )
        .join(
            Graduate,
            Graduate.program_id
            == Program.id
        )
        .group_by(
            Program.id,
            Program.name
        )
        .all()
    )

    employment_by_program = []

    for program_id, program_name, total in program_rows:

        contracted = (
            db.query(
                func.count(
                    func.distinct(
                        CandidateApplication.graduate_id
                    )
                )
            )
            .join(
                Graduate,
                Graduate.user_id
                == CandidateApplication.graduate_id
            )
            .filter(
                Graduate.program_id == program_id,
                CandidateApplication.status
                == ApplicationStatus.CONTRATADO
            )
            .scalar()
            or 0
        )

        percentage = (
            (contracted / total) * 100
            if total > 0
            else 0
        )

        employment_by_program.append({
            "program": program_name,
            "percentage": round(
                percentage,
                2
            )
        })

    # ==========================================================
    # 6. INDUSTRIAS CON MAYOR CONTRATACIÓN
    # ==========================================================

    industry_rows = (
        db.query(
            Sector.name,
            func.count(
                func.distinct(
                    CandidateApplication.graduate_id
                )
            ).label("contracted")
        )
        .join(
            Company,
            Company.sector_id
            == Sector.id
        )
        .join(
            JobOffer,
            JobOffer.company_id
            == Company.user_id
        )
        .join(
            CandidateApplication,
            CandidateApplication.job_offer_id
            == JobOffer.id
        )
        .filter(
            CandidateApplication.status
            == ApplicationStatus.CONTRATADO
        )
        .group_by(
            Sector.id,
            Sector.name
        )
        .order_by(
            func.count(
                func.distinct(
                    CandidateApplication.graduate_id
                )
            ).desc()
        )
        .all()
    )

    total_industry_contracts = sum(
        contracted
        for _, contracted in industry_rows
    )

    industries = []

    for sector_name, contracted in industry_rows:

        percentage = (
            (contracted / total_industry_contracts) * 100
            if total_industry_contracts > 0
            else 0
        )

        industries.append({
            "sector": sector_name,
            "percentage": round(
                percentage,
                2
            )
        })

    # ==========================================================
    # 7. SALARIO PROMEDIO POR PROGRAMA
    # ==========================================================

    salary_program_rows = (
        db.query(
            Program.name,
            JobOffer.salary_min,
            JobOffer.salary_max
        )
        .join(
            JobOffer,
            JobOffer.program_id
            == Program.id
        )
        .join(
            CandidateApplication,
            CandidateApplication.job_offer_id
            == JobOffer.id
        )
        .filter(
            CandidateApplication.status
            == ApplicationStatus.CONTRATADO,
            JobOffer.salary_min.isnot(None),
            JobOffer.salary_max.isnot(None)
        )
        .all()
    )

    program_salaries = {}

    for program_name, salary_min, salary_max in salary_program_rows:

        salary = (
            salary_min + salary_max
        ) / 2

        if program_name not in program_salaries:
            program_salaries[program_name] = []

        program_salaries[program_name].append(
            salary
        )

    salary_by_program = []

    for program_name, salaries_list in program_salaries.items():

        average_program_salary = (
            sum(salaries_list)
            / len(salaries_list)
        )

        salary_by_program.append({
            "program": program_name,
            "average_salary": round(
                average_program_salary,
                2
            )
        })

    # ==========================================================
    # 8. ESTADO DE LAS POSTULACIONES
    # ==========================================================

    status_rows = (
        db.query(
            CandidateApplication.status,
            func.count(
                CandidateApplication.id
            )
        )
        .group_by(
            CandidateApplication.status
        )
        .all()
    )

    application_status = []

    for status, count in status_rows:

        status_value = (
            status.value
            if hasattr(status, "value")
            else str(status)
        )

        application_status.append({
            "status": status_value,
            "count": count
        })

    # ==========================================================
    # 9. RESPUESTA DEL DASHBOARD
    # ==========================================================

    return {
        "summary": {
            "total_graduates": total_graduates,
            "employment_rate": round(
                employment_rate,
                2
            ),
            "average_salary": round(
                average_salary,
                2
            ),
            "average_time_to_first_job": round(
                average_time_to_first_job,
                2
            )
        },

        "employment_by_program":
            employment_by_program,

        "industries":
            industries,

        "salary_by_program":
            salary_by_program,

        "application_status":
            application_status
    }