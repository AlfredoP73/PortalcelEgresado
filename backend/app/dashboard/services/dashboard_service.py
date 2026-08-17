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

def get_dashboard(db: Session, program_id: int = None, year: int = None):
    # Base query for graduates
    grad_query = db.query(Graduate)
    if program_id:
        grad_query = grad_query.filter(Graduate.program_id == program_id)
    if year:
        grad_query = grad_query.filter(Graduate.graduation_year == year)
    
    total_graduates = grad_query.count()

    # Contracted
    contracted_query = db.query(func.count(func.distinct(CandidateApplication.graduate_id))).join(
        Graduate, Graduate.user_id == CandidateApplication.graduate_id
    ).filter(CandidateApplication.status == ApplicationStatus.CONTRATADO)
    
    if program_id:
        contracted_query = contracted_query.filter(Graduate.program_id == program_id)
    if year:
        contracted_query = contracted_query.filter(Graduate.graduation_year == year)
        
    contracted_graduates = contracted_query.scalar() or 0
    employment_rate = (contracted_graduates / total_graduates) * 100 if total_graduates > 0 else 0

    # 3. TIEMPO PROMEDIO PARA CONSEGUIR EL PRIMER EMPLEO
    we_query = db.query(
        Graduate,
        func.min(WorkExperience.start_date).label("first_job_date")
    ).join(WorkExperience, WorkExperience.graduate_id == Graduate.user_id)
    
    if program_id:
        we_query = we_query.filter(Graduate.program_id == program_id)
    if year:
        we_query = we_query.filter(Graduate.graduation_year == year)
        
    graduates_with_experience = we_query.group_by(Graduate.user_id).all()

    total_months = 0
    experience_count = 0
    for graduate, first_job_date in graduates_with_experience:
        if not first_job_date:
            continue
        months = ((first_job_date.year - graduate.graduation_year) * 12 + (first_job_date.month - 1))
        if months >= 0:
            total_months += months
            experience_count += 1
    average_time_to_first_job = total_months / experience_count if experience_count > 0 else 0

    # 4. SALARIO PROMEDIO
    sal_query = db.query(JobOffer.salary_min, JobOffer.salary_max).join(
        CandidateApplication, CandidateApplication.job_offer_id == JobOffer.id
    ).join(Graduate, Graduate.user_id == CandidateApplication.graduate_id).filter(
        CandidateApplication.status == ApplicationStatus.CONTRATADO,
        JobOffer.salary_min.isnot(None),
        JobOffer.salary_max.isnot(None)
    )
    if program_id:
        sal_query = sal_query.filter(Graduate.program_id == program_id)
    if year:
        sal_query = sal_query.filter(Graduate.graduation_year == year)
        
    salary_rows = sal_query.all()
    salaries = [(s_min + s_max) / 2 for s_min, s_max in salary_rows]
    average_salary = sum(salaries) / len(salaries) if salaries else 0

    # 5. EMPLEABILIDAD POR PROGRAMA
    program_rows = db.query(
        Program.id, Program.name, func.count(func.distinct(Graduate.user_id)).label("total_graduates")
    ).join(Graduate, Graduate.program_id == Program.id)
    if year:
        program_rows = program_rows.filter(Graduate.graduation_year == year)
    program_rows = program_rows.group_by(Program.id, Program.name).all()

    employment_by_program = []
    for p_id, p_name, total in program_rows:
        contracted = db.query(func.count(func.distinct(CandidateApplication.graduate_id))).join(
            Graduate, Graduate.user_id == CandidateApplication.graduate_id
        ).filter(
            Graduate.program_id == p_id,
            CandidateApplication.status == ApplicationStatus.CONTRATADO
        )
        if year:
            contracted = contracted.filter(Graduate.graduation_year == year)
        contracted_val = contracted.scalar() or 0
        pct = (contracted_val / total) * 100 if total > 0 else 0
        employment_by_program.append({"program": p_name, "percentage": round(pct, 2)})

    # 6. INDUSTRIAS CON MAYOR CONTRATACIÓN
    ind_query = db.query(
        Sector.name, func.count(func.distinct(CandidateApplication.graduate_id)).label("contracted")
    ).join(Company, Company.sector_id == Sector.id).join(
        JobOffer, JobOffer.company_id == Company.user_id
    ).join(
        CandidateApplication, CandidateApplication.job_offer_id == JobOffer.id
    ).join(Graduate, Graduate.user_id == CandidateApplication.graduate_id).filter(
        CandidateApplication.status == ApplicationStatus.CONTRATADO
    )
    if program_id:
        ind_query = ind_query.filter(Graduate.program_id == program_id)
    if year:
        ind_query = ind_query.filter(Graduate.graduation_year == year)
    ind_query = ind_query.group_by(Sector.id, Sector.name).order_by(
        func.count(func.distinct(CandidateApplication.graduate_id)).desc()
    ).all()

    total_industry_contracts = sum(c for _, c in ind_query)
    industries = [
        {"sector": s_name, "percentage": round((c / total_industry_contracts) * 100, 2)}
        for s_name, c in ind_query
    ]

    # 7. SALARIO PROMEDIO POR PROGRAMA
    sal_prog_query = db.query(
        Program.name, JobOffer.salary_min, JobOffer.salary_max
    ).join(JobOffer, JobOffer.program_id == Program.id).join(
        CandidateApplication, CandidateApplication.job_offer_id == JobOffer.id
    ).join(Graduate, Graduate.user_id == CandidateApplication.graduate_id).filter(
        CandidateApplication.status == ApplicationStatus.CONTRATADO,
        JobOffer.salary_min.isnot(None),
        JobOffer.salary_max.isnot(None)
    )
    if year:
        sal_prog_query = sal_prog_query.filter(Graduate.graduation_year == year)
    salary_program_rows = sal_prog_query.all()
    
    program_salaries = {}
    for p_name, s_min, s_max in salary_program_rows:
        sal = (s_min + s_max) / 2
        if p_name not in program_salaries:
            program_salaries[p_name] = []
        program_salaries[p_name].append(sal)
        
    salary_by_program = [
        {"program": k, "average_salary": round(sum(v)/len(v), 2)}
        for k, v in program_salaries.items()
    ]

    # 8. ESTADO DE LAS POSTULACIONES
    status_q = db.query(
        CandidateApplication.status, func.count(CandidateApplication.id)
    ).join(Graduate, Graduate.user_id == CandidateApplication.graduate_id)
    if program_id:
        status_q = status_q.filter(Graduate.program_id == program_id)
    if year:
        status_q = status_q.filter(Graduate.graduation_year == year)
    status_rows = status_q.group_by(CandidateApplication.status).all()

    application_status = [
        {"status": str(st.value if hasattr(st, 'value') else st), "count": count}
        for st, count in status_rows
    ]

    return {
        "summary": {
            "total_graduates": total_graduates,
            "employment_rate": round(employment_rate, 2),
            "average_salary": round(average_salary, 2),
            "average_time_to_first_job": round(average_time_to_first_job, 2)
        },
        "employment_by_program": employment_by_program,
        "industries": industries,
        "salary_by_program": salary_by_program,
        "application_status": application_status
    }

def get_company_dashboard(db: Session, company_id: int):
    active_offers = db.query(JobOffer).filter(JobOffer.company_id == company_id, JobOffer.status == 'ACTIVE').count()
    
    apps_query = db.query(CandidateApplication).join(
        JobOffer, JobOffer.id == CandidateApplication.job_offer_id
    ).filter(JobOffer.company_id == company_id)
    
    total_applicants = apps_query.count()
    hired_candidates = apps_query.filter(CandidateApplication.status == ApplicationStatus.CONTRATADO).count()
    
    average_hiring_time_days = 15 # Mocked for simplicity
    conversion_rate = (hired_candidates / total_applicants * 100) if total_applicants > 0 else 0
    visits_to_offers = total_applicants * 4 # Mocked

    status_rows = db.query(
        CandidateApplication.status, func.count(CandidateApplication.id)
    ).join(
        JobOffer, JobOffer.id == CandidateApplication.job_offer_id
    ).filter(JobOffer.company_id == company_id).group_by(CandidateApplication.status).all()

    applications_by_status = [
        {"status": str(st.value if hasattr(st, 'value') else st), "count": count}
        for st, count in status_rows
    ]

    # Hiring Funnel (Same as applications_by_status but ordered for funnel)
    order_map = {"POSTULADO": 1, "EN_EVALUACION": 2, "ENTREVISTADO": 3, "CONTRATADO": 4}
    hiring_funnel = sorted(applications_by_status, key=lambda x: order_map.get(x["status"], 5))

    # Applicants by Program
    prog_rows = db.query(
        Program.name, func.count(CandidateApplication.id)
    ).join(
        JobOffer, JobOffer.id == CandidateApplication.job_offer_id
    ).join(
        Graduate, Graduate.user_id == CandidateApplication.graduate_id
    ).join(
        Program, Program.id == Graduate.program_id
    ).filter(JobOffer.company_id == company_id).group_by(Program.name).all()

    applicants_by_program = [{"program": p_name, "count": count} for p_name, count in prog_rows]

    # Timeline (Mocked for simplicity)
    applications_timeline = [
        {"date": "Ene", "count": 12}, {"date": "Feb", "count": 19}, {"date": "Mar", "count": 15},
        {"date": "Abr", "count": 22}, {"date": "May", "count": 30}, {"date": "Jun", "count": 28}
    ]

    # Frequent Skills (Mocked)
    frequent_skills = [
        {"skill": "Trabajo en equipo", "count": 45},
        {"skill": "Liderazgo", "count": 38},
        {"skill": "Comunicación asertiva", "count": 35},
        {"skill": "Resolución de problemas", "count": 25},
        {"skill": "Inglés B2", "count": 20}
    ]

    return {
        "summary": {
            "active_offers": active_offers,
            "total_applicants": total_applicants,
            "hired_candidates": hired_candidates,
            "average_hiring_time_days": average_hiring_time_days,
            "conversion_rate": round(conversion_rate, 2),
            "visits_to_offers": visits_to_offers
        },
        "applications_by_status": applications_by_status,
        "hiring_funnel": hiring_funnel,
        "applicants_by_program": applicants_by_program,
        "applications_timeline": applications_timeline,
        "frequent_skills": frequent_skills
    }

def get_graduate_dashboard(db: Session, graduate_id: int):
    total_applications = db.query(CandidateApplication).filter(CandidateApplication.graduate_id == graduate_id).count()
    interviews = db.query(CandidateApplication).filter(
        CandidateApplication.graduate_id == graduate_id,
        CandidateApplication.status == ApplicationStatus.ENTREVISTADO
    ).count()
    
    # Get program average salary and expected salary
    graduate = db.query(Graduate).filter(Graduate.user_id == graduate_id).first()
    program_average_salary = 0
    expected_salary = 0
    if graduate and graduate.program_id:
        sal_rows = db.query(JobOffer.salary_min, JobOffer.salary_max).join(
            CandidateApplication, CandidateApplication.job_offer_id == JobOffer.id
        ).join(Graduate, Graduate.user_id == CandidateApplication.graduate_id).filter(
            Graduate.program_id == graduate.program_id,
            CandidateApplication.status == ApplicationStatus.CONTRATADO,
            JobOffer.salary_min.isnot(None),
            JobOffer.salary_max.isnot(None)
        ).all()
        salaries = [(s_min + s_max) / 2 for s_min, s_max in sal_rows]
        if salaries:
            program_average_salary = sum(salaries) / len(salaries)

        # Expected salary based on applied offers
        applied_sal_rows = db.query(JobOffer.salary_min, JobOffer.salary_max).join(
            CandidateApplication, CandidateApplication.job_offer_id == JobOffer.id
        ).filter(
            CandidateApplication.graduate_id == graduate_id,
            JobOffer.salary_min.isnot(None),
            JobOffer.salary_max.isnot(None)
        ).all()
        app_salaries = [(s_min + s_max) / 2 for s_min, s_max in applied_sal_rows]
        if app_salaries:
            expected_salary = sum(app_salaries) / len(app_salaries)
            
    status_rows = db.query(
        CandidateApplication.status, func.count(CandidateApplication.id)
    ).filter(CandidateApplication.graduate_id == graduate_id).group_by(CandidateApplication.status).all()

    applications_by_status = [
        {"status": str(st.value if hasattr(st, 'value') else st), "count": count}
        for st, count in status_rows
    ]

    response_rate = (interviews / total_applications * 100) if total_applications > 0 else 0
    profile_views = total_applications * 5 # Mocked

    # Radar
    skills_radar = [
        {"skill": "Trabajo en Equipo", "graduate": 90, "market": 85},
        {"skill": "Comunicación", "graduate": 80, "market": 90},
        {"skill": "Liderazgo", "graduate": 70, "market": 75},
        {"skill": "Gestión de Proyectos", "graduate": 85, "market": 80},
        {"skill": "Inglés", "graduate": 60, "market": 85}
    ]

    # Timeline (Mocked)
    applications_timeline = [
        {"date": "Ene", "count": 2}, {"date": "Feb", "count": 5}, {"date": "Mar", "count": 3},
        {"date": "Abr", "count": 8}, {"date": "May", "count": 4}, {"date": "Jun", "count": 7}
    ]

    # Market Salaries (Mocked)
    market_salaries = [
        {"range": "$1.5M - $2M", "count": 10},
        {"range": "$2M - $2.5M", "count": 35},
        {"range": "$2.5M - $3M", "count": 40},
        {"range": "$3M - $4M", "count": 20},
        {"range": "+$4M", "count": 5}
    ]

    return {
        "summary": {
            "total_applications": total_applications,
            "interviews": interviews,
            "offers_viewed": total_applications * 3, # Mocked
            "program_average_salary": round(program_average_salary, 2),
            "response_rate": round(response_rate, 2),
            "expected_salary": round(expected_salary, 2),
            "profile_views": profile_views
        },
        "applications_by_status": applications_by_status,
        "skills_radar": skills_radar,
        "applications_timeline": applications_timeline,
        "market_salaries": market_salaries
    }