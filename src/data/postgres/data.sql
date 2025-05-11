-- ================================================
-- PostgreSQL Script Consolidado para Sistema de Incidentes
-- ================================================

-- Limpiar tipos y tablas existentes
DROP TYPE IF EXISTS priority_enum CASCADE;

DROP TYPE IF EXISTS incident_status_enum CASCADE;

DROP TABLE IF EXISTS notification;

DROP TABLE IF EXISTS incident_history;

DROP TABLE IF EXISTS incident_type_admin;

DROP TABLE IF EXISTS incident;

DROP TABLE IF EXISTS incident_type;

DROP TABLE IF EXISTS incident_status;

DROP TABLE IF EXISTS location;

DROP TABLE IF EXISTS app_user;

DROP TABLE IF EXISTS user_role;

-- Tipos ENUM
CREATE TYPE priority_enum AS ENUM ('Alta', 'Media', 'Baja');

CREATE TYPE incident_status_enum AS ENUM ('pendiente', 'en_progreso', 'resuelto', 'cerrado', 're_abierto');

-- Tabla de roles de usuario
CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla de usuarios
CREATE TABLE app_user (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    google_id VARCHAR(150),
    profile_picture TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    role_id INT REFERENCES user_role (id) ON DELETE SET NULL DEFAULT 1,
    password TEXT,
    email_validated BOOLEAN DEFAULT FALSE
);

-- Tabla de ubicaciones
CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(15, 10),
    longitude DECIMAL(15, 10),
    altitude DECIMAL(15, 10),
    reference TEXT
);

-- Tipos de incidentes
CREATE TABLE incident_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Estados del incidente
CREATE TABLE incident_status (
    id SERIAL PRIMARY KEY,
    name incident_status_enum NOT NULL
);

-- Tabla de incidentes
CREATE TABLE incident (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150),
    description TEXT,
    image_url TEXT,
    priority priority_enum,
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    close_date TIMESTAMP,
    type_id INT REFERENCES incident_type (id) ON DELETE SET NULL,
    status_id INT REFERENCES incident_status (id) ON DELETE SET NULL,
    user_id INT REFERENCES app_user (id) ON DELETE SET NULL,
    location_id INT REFERENCES location (id) ON DELETE SET NULL,
    assigned_admin_id INT REFERENCES app_user (id) ON DELETE SET NULL
);

-- Historial de incidentes
CREATE TABLE incident_history (
    id SERIAL PRIMARY KEY,
    incident_id INT REFERENCES incident (id) ON DELETE CASCADE,
    previous_status VARCHAR(100),
    new_status VARCHAR(100),
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,
    modified_by INT REFERENCES app_user (id) ON DELETE SET NULL
);

-- Notificaciones
CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES app_user (id) ON DELETE CASCADE,
    receiver_id INT REFERENCES app_user (id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relación entre tipo de incidente y administradores
CREATE TABLE incident_type_admin (
    id SERIAL PRIMARY KEY,
    incident_type_id INT NOT NULL REFERENCES incident_type (id) ON DELETE CASCADE,
    admin_id INT NOT NULL REFERENCES app_user (id) ON DELETE CASCADE
);

-- =============================
-- Insertar datos iniciales
-- =============================

-- Roles
INSERT INTO
    user_role (name)
VALUES ('user'),
    ('admin'),
    ('superadmin');

-- Estados
INSERT INTO
    incident_status (name)
VALUES ('pendiente'),
    ('en_progreso'),
    ('resuelto'),
    ('cerrado'),
    ('re_abierto');

-- Tipos de incidente
INSERT INTO
    incident_type (name)
VALUES ('Infraestructura'),
    ('Seguridad'),
    ('TI'),
    ('Limpieza');

-- Ejemplo de actualización de roles y estados
UPDATE app_user SET role_id = 3 WHERE id = 5;
-- UPDATE incident SET status_id = 2 WHERE id = 46;

-- =============================
-- Consultas útiles (comentadas)
-- =============================

-- SELECT * FROM app_user;

-- SELECT * FROM user_role;

-- SELECT * FROM incident_type;

-- SELECT * FROM incident_status;

-- SELECT * FROM location;

-- SELECT * FROM incident;

-- SELECT * FROM incident_history;

-- SELECT * FROM notification;

-- SELECT * FROM incident_type_admin;

-- SELECT detallado de incidentes (descomentar para usar)
-- SELECT
--   i.id AS incident_id,
--   i.title,
--   i.description,
--   i.priority,
--   i.report_date,
--   i.close_date,
--   u.first_name || ' ' || u.last_name AS reported_by,
--   u.email AS user_email,
--   it.name AS incident_type,
--   s.name AS status,
--   l.latitude,
--   l.longitude,
--   l.altitude,
--   l.reference AS location_reference
-- FROM incident i
-- LEFT JOIN app_user u ON i.user_id = u.id
-- LEFT JOIN incident_type it ON i.type_id = it.id
-- LEFT JOIN incident_status s ON i.status_id = s.id
-- LEFT JOIN location l ON i.location_id = l.id
-- ORDER BY i.report_date DESC;