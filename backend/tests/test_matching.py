import pytest

from app.matchmaking.services.matching_service import calcular_afinidad
from decimal import Decimal

WEIGHTS = {"program_weight": Decimal("0.40"), "skills_weight": Decimal("0.40"), "experience_weight": Decimal("0.20")}


def graduate(program_id=1, skills=None, years=2.0, survey=None):
    return {"program_id": program_id, "skills": skills or {}, "total_experience_years": years, "survey": survey}


def job_offer(program_id=1, skills=None, min_years=0, sector=None):
    return {
        "program_id": program_id,
        "min_experience_years": min_years,
        "company_sector": sector,
        "required_skills": skills or {},
    }


def skills(*ids):
    return {sid: "Intermedio" for sid in ids}


def test_match_perfecto_es_100():
    g = graduate(program_id=1, skills=skills(1, 2, 3), years=5)
    j = job_offer(program_id=1, skills=skills(1, 2, 3), min_years=2)
    r = calcular_afinidad(g, j, WEIGHTS)
    assert r["score"] == Decimal("100.00")


def test_sin_programa_no_penaliza_como_match():
    r = calcular_afinidad(graduate(program_id=None), job_offer(program_id=None), WEIGHTS)
    assert r["program_score"] == Decimal("0.00")
    assert r["score"] < Decimal("100.00")


def test_programa_distinto_da_cero_en_ese_criterio():
    r = calcular_afinidad(graduate(program_id=1), job_offer(program_id=2), WEIGHTS)
    assert r["program_score"] == Decimal("0.00")


def test_skills_jaccard_sobre_requeridas():
    g = graduate(skills=skills(1, 2))
    j = job_offer(skills=skills(1, 2, 3, 4))
    r = calcular_afinidad(g, j, WEIGHTS)
    assert r["skills_score"] == Decimal("50.00")


def test_vacante_sin_skills_no_penaliza():
    r = calcular_afinidad(graduate(), job_offer(skills={}), WEIGHTS)
    assert r["skills_score"] == Decimal("100.00")


def test_experiencia_escala_progresiva():
    g = graduate(years=1.0)
    j = job_offer(min_years=2)
    r = calcular_afinidad(g, j, WEIGHTS)
    assert r["experience_score"] == Decimal("50.00")


def test_experiencia_cero_requerida_da_100():
    g = graduate(years=0)
    j = job_offer(min_years=0)
    r = calcular_afinidad(g, j, WEIGHTS)
    assert r["experience_score"] == Decimal("100.00")


def test_pesos_personalizados_ponderan():
    weights = {"program_weight": Decimal("0.60"), "skills_weight": Decimal("0.30"), "experience_weight": Decimal("0.10")}
    g = graduate(program_id=1, skills=skills(1), years=1.0)
    j = job_offer(program_id=1, skills=skills(1, 2), min_years=2)
    r = calcular_afinidad(g, j, weights)
    expected = Decimal("100.00") * Decimal("0.60") + Decimal("50.00") * Decimal("0.30") + Decimal("50.00") * Decimal("0.10")
    assert r["score"] == expected.quantize(Decimal("0.01"))


def test_score_dentro_de_rango():
    g = graduate(program_id=1, skills=skills(1), years=0)
    j = job_offer(program_id=2, skills=skills(2, 3), min_years=3)
    r = calcular_afinidad(g, j, WEIGHTS)
    assert Decimal("0.00") <= r["score"] <= Decimal("100.00")


def test_sin_encuesta_no_afecta_el_score():
    g = graduate(program_id=1, skills=skills(1, 2, 3), years=5)
    j = job_offer(program_id=1, skills=skills(1, 2, 3), min_years=2)
    r = calcular_afinidad(g, j, WEIGHTS)
    assert r["survey_bonus"] == Decimal("0.00")
    assert r["score"] == Decimal("100.00")


def test_bonus_no_laborando():
    g = graduate(program_id=2, survey={"laborando": "No", "sector": None, "relacion_programa": None})
    j = job_offer(program_id=2, skills=skills(1), min_years=0)
    r = calcular_afinidad(g, j, WEIGHTS)
    assert r["survey_bonus"] == Decimal("4.00")


def test_bonus_sector_coincide():
    g = graduate(survey={"laborando": "Sí", "sector": "Tecnología", "relacion_programa": None})
    j = job_offer(sector="Tecnología y Software")
    r = calcular_afinidad(g, j, WEIGHTS)
    assert r["survey_bonus"] == Decimal("5.00")


def test_bonus_acumula_y_capea_en_100():
    g = graduate(
        program_id=1,
        skills=skills(1, 2, 3),
        years=5,
        survey={"laborando": "No", "sector": "Tecnología", "relacion_programa": "Sí, totalmente"},
    )
    j = job_offer(program_id=1, skills=skills(1, 2, 3), min_years=2, sector="Tecnología")
    r = calcular_afinidad(g, j, WEIGHTS)
    assert r["survey_bonus"] == Decimal("12.00")
    assert r["score"] == Decimal("100.00")


def test_bonus_relacion_parcial():
    g = graduate(survey={"laborando": None, "sector": None, "relacion_programa": "Parcialmente"})
    j = job_offer()
    r = calcular_afinidad(g, j, WEIGHTS)
    assert r["survey_bonus"] == Decimal("1.50")