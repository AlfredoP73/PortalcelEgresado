-- ==============================================================================
-- MIGRACIÓN: MÓDULO 3 - ALGORITMO DE MATCHMAKING
-- Ejecutar UNA sola vez sobre la base ya existente (egresados_db).
-- No modifica init.sql porque ese script solo corre en la primera
-- inicialización del volumen de Postgres (docker-entrypoint-initdb.d).
--
-- Cómo aplicarla:
--   docker exec -i portaldel_egresado_db psql -U postgres -d egresados_db < backend/migration_matchmaking.sql
-- ==============================================================================

-- Habilidades requeridas por vacante (estructura espejo de graduate_skills)
CREATE TABLE IF NOT EXISTS job_offer_skills (
    job_offer_id INT REFERENCES job_offers(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    required_level VARCHAR(50), -- 'Básico', 'Intermedio', 'Avanzado'
    PRIMARY KEY (job_offer_id, skill_id)
);

-- Experiencia mínima requerida por la vacante
ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS min_experience_years INT DEFAULT 0;

-- Resultados de match cacheados (evita recalcular en cada request de lectura)
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    graduate_id INT REFERENCES graduates(user_id) ON DELETE CASCADE,
    job_offer_id INT REFERENCES job_offers(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    program_score NUMERIC(5,2),
    skills_score NUMERIC(5,2),
    experience_score NUMERIC(5,2),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(graduate_id, job_offer_id)
);

-- Notificaciones de alta compatibilidad (Módulo 3.2)
CREATE TABLE IF NOT EXISTS match_notifications (
    id SERIAL PRIMARY KEY,
    graduate_id INT REFERENCES graduates(user_id) ON DELETE CASCADE,
    job_offer_id INT REFERENCES job_offers(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- La tabla matchmaking_weights ya existe desde init.sql; solo aseguramos
-- que exista al menos un registro con los pesos por defecto.
INSERT INTO matchmaking_weights (program_weight, skills_weight, experience_weight)
SELECT 0.40, 0.40, 0.20
WHERE NOT EXISTS (SELECT 1 FROM matchmaking_weights);

-- ------------------------------------------------------------------------------
-- DATOS DUMMY para probar el algoritmo con las vacantes/egresado ya insertados
-- en init.sql (job_offers 1 y 2, graduate user_id = 3)
-- ------------------------------------------------------------------------------
INSERT INTO skills (name) VALUES
    ('React'), ('Node.js'), ('PostgreSQL'), ('Python'), ('SQL'), ('Excel avanzado')
ON CONFLICT (name) DO NOTHING;

-- Requisitos de habilidades para la vacante 1 (Desarrollador Full Stack)
INSERT INTO job_offer_skills (job_offer_id, skill_id, required_level)
SELECT 1, id, 'Intermedio' FROM skills WHERE name IN ('React', 'Node.js', 'PostgreSQL')
ON CONFLICT DO NOTHING;

-- Requisitos de habilidades para la vacante 2 (Analista de Datos Junior)
INSERT INTO job_offer_skills (job_offer_id, skill_id, required_level)
SELECT 2, id, 'Intermedio' FROM skills WHERE name IN ('Python', 'SQL', 'Excel avanzado')
ON CONFLICT DO NOTHING;

-- Experiencia mínima de cada vacante
UPDATE job_offers SET min_experience_years = 2 WHERE id = 1;
UPDATE job_offers SET min_experience_years = 0 WHERE id = 2;

-- Habilidades del egresado de prueba (Juan Pérez, user_id = 3)
INSERT INTO graduate_skills (graduate_id, skill_id, proficiency_level)
SELECT 3, id, 'Intermedio' FROM skills WHERE name IN ('React', 'PostgreSQL')
ON CONFLICT DO NOTHING;
