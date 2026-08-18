from decimal import Decimal

class MatchScoreBuilder:
    def __init__(self, graduate: dict, job_offer: dict, weights: dict):
        self.graduate = graduate
        self.job_offer = job_offer
        self.weights = weights
        self.program_score = Decimal("0.00")
        self.skills_score = Decimal("0.00")
        self.experience_score = Decimal("0.00")
        self.survey_bonus = Decimal("0.00")
        self.final_score = Decimal("0.00")

    def build_program_score(self):
        g_pid = self.graduate.get("program_id")
        j_pid = self.job_offer.get("program_id")
        if g_pid is not None and j_pid is not None and g_pid == j_pid:
            self.program_score = Decimal("100.00")
        else:
            self.program_score = Decimal("0.00")
        return self

    def build_skills_score(self):
        req_skills = set(self.job_offer["required_skills"].keys())
        grad_skills = set(self.graduate["skills"].keys())
        if req_skills:
            self.skills_score = (Decimal(len(req_skills & grad_skills)) / Decimal(len(req_skills))) * 100
        else:
            self.skills_score = Decimal("100.00")
        return self

    def build_experience_score(self):
        min_exp = self.job_offer["min_experience_years"] or 0
        if min_exp == 0:
            self.experience_score = Decimal("100.00")
        else:
            ratio = min(Decimal(str(self.graduate["total_experience_years"])) / Decimal(min_exp), Decimal("1.0"))
            self.experience_score = ratio * 100
        return self

    def build_survey_bonus(self):
        survey = self.graduate.get("survey") or {}
        bonus = Decimal("0.00")

        laborando = str(survey.get("laborando") or "").strip().lower()
        if laborando.startswith("no"):
            bonus += Decimal("4.00")

        relacion = str(survey.get("relacion_programa") or "").strip().lower()
        if "total" in relacion or relacion == "sí" or relacion == "si":
            bonus += Decimal("3.00")
        elif "parcial" in relacion:
            bonus += Decimal("1.50")

        sector = str(survey.get("sector") or "").strip().lower()
        company_sector = str(self.job_offer.get("company_sector") or "").strip().lower()
        if sector and company_sector and (sector in company_sector or company_sector in sector):
            bonus += Decimal("5.00")

        self.survey_bonus = bonus
        return self

    def build_final_score(self):
        base_score = (
            self.program_score * Decimal(str(self.weights["program_weight"]))
            + self.skills_score * Decimal(str(self.weights["skills_weight"]))
            + self.experience_score * Decimal(str(self.weights["experience_weight"]))
        )
        self.final_score = min(base_score + self.survey_bonus, Decimal("100.00"))
        return self

    def get_result(self) -> dict:
        return {
            "score": round(self.final_score, 2),
            "program_score": round(self.program_score, 2),
            "skills_score": round(self.skills_score, 2),
            "experience_score": round(self.experience_score, 2),
            "survey_bonus": round(self.survey_bonus, 2),
        }
