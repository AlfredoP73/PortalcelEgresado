-- ==============================================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS (init.sql)
-- NORMALIZADO A 3FN PARA TODOS LOS MÓDULOS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. CATÁLOGOS GLOBALES (Evitan dependencias transitivas - 3FN)
-- ------------------------------------------------------------------------------
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- 'ADMIN', 'COORDINATOR', 'GRADUATE', 'COMPANY'
);

CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_id INT REFERENCES countries(id) ON DELETE CASCADE
);

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_id INT REFERENCES states(id) ON DELETE CASCADE
);

CREATE TABLE sectors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    faculty_id INT REFERENCES faculties(id) ON DELETE CASCADE
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- ------------------------------------------------------------------------------
-- MÓDULO 4: AUTENTICACIÓN, ROLES Y DASHBOARD (Usuarios base)
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Para autenticación JWT
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- MÓDULO 1: PORTAL Y HOJA DE VIDA DEL EGRESADO
-- ------------------------------------------------------------------------------
CREATE TABLE graduates (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    program_id INT REFERENCES programs(id) ON DELETE RESTRICT,
    graduation_year INT NOT NULL,
    phone VARCHAR(20),
    cv_url VARCHAR(255),
    profile_summary TEXT
);

CREATE TABLE graduate_skills (
    graduate_id INT REFERENCES graduates(user_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50), -- 'Básico', 'Intermedio', 'Avanzado'
    PRIMARY KEY (graduate_id, skill_id)
);

CREATE TABLE graduate_languages (
    graduate_id INT REFERENCES graduates(user_id) ON DELETE CASCADE,
    language_id INT REFERENCES languages(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50), -- 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
    PRIMARY KEY (graduate_id, language_id)
);

CREATE TABLE work_experiences (
    id SERIAL PRIMARY KEY,
    graduate_id INT REFERENCES graduates(user_id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    position VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT
);

CREATE TABLE academic_histories (
    id SERIAL PRIMARY KEY,
    graduate_id INT REFERENCES graduates(user_id) ON DELETE CASCADE,
    institution VARCHAR(150) NOT NULL,
    degree VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE
);

CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    graduate_id INT REFERENCES graduates(user_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    issuing_organization VARCHAR(150) NOT NULL,
    issue_date DATE NOT NULL
);

-- ------------------------------------------------------------------------------
-- MÓDULO 2: GESTIÓN DE EMPRESAS Y OFERTAS LABORALES
-- ------------------------------------------------------------------------------
CREATE TABLE companies (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255) NOT NULL,
    sector_id INT REFERENCES sectors(id) ON DELETE RESTRICT,
    city_id INT REFERENCES cities(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'PENDING' -- 'PENDING', 'APPROVED', 'REJECTED'
);

CREATE TABLE job_offers (
    id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    functions TEXT NOT NULL,
    salary_min NUMERIC(10, 2),
    salary_max NUMERIC(10, 2),
    program_id INT REFERENCES programs(id) ON DELETE RESTRICT,
    closing_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' -- 'ACTIVE', 'CLOSED'
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_offer_id INT REFERENCES job_offers(id) ON DELETE CASCADE,
    graduate_id INT REFERENCES graduates(user_id) ON DELETE CASCADE,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'POSTULADO' -- 'POSTULADO', 'EN_EVALUACION', 'ENTREVISTADO', 'CONTRATADO'
);

-- ------------------------------------------------------------------------------
-- MÓDULO 3: ALGORITMO DE MATCHMAKING
-- ------------------------------------------------------------------------------
CREATE TABLE matchmaking_weights (
    id SERIAL PRIMARY KEY,
    program_weight NUMERIC(4, 2) DEFAULT 0.40,
    skills_weight NUMERIC(4, 2) DEFAULT 0.40,
    experience_weight NUMERIC(4, 2) DEFAULT 0.20,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- DATOS DUMMY INICIALES PARA TESTEAR JWT Y RUTAS
-- ==============================================================================
INSERT INTO roles (name) VALUES ('ADMIN'), ('COMPANY');

-- Hash for 'password123' generated with bcrypt
INSERT INTO users (email, password_hash, role_id) VALUES 
('admin@portal.com', '$2b$12$KkQoT6q3E1.gS/4M.1i.Pujh.P6P4rP8jU3/4b1B.nQz/yXzRzRji', 1),
('empresa@ejemplo.com', '$2b$12$KkQoT6q3E1.gS/4M.1i.Pujh.P6P4rP8jU3/4b1B.nQz/yXzRzRji', 2);
