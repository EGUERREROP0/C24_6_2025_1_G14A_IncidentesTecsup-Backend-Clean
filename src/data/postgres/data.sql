-- ================================================
-- PostgreSQL Script for Incident Reporting System
-- ================================================

-- Drop existing types and tables (for dev/testing purposes)
DROP TYPE IF EXISTS priority_enum CASCADE;

DROP TYPE IF EXISTS incident_status_enum CASCADE;

DROP TABLE IF EXISTS notification;

DROP TABLE IF EXISTS incident_history;

DROP TABLE IF EXISTS incident;

DROP TABLE IF EXISTS incident_type;

DROP TABLE IF EXISTS incident_status;

DROP TABLE IF EXISTS location;

DROP TABLE IF EXISTS app_user;

DROP TABLE IF EXISTS user_role;

-- ENUM types
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high');

CREATE TYPE incident_status_enum AS ENUM ('pending', 'in_progress', 'resolved', 'closed', 'reopened');

-- User roles
CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Users
CREATE TABLE app_user (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    google_id VARCHAR(150),
    profile_picture TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    role_id INT REFERENCES user_role (id) ON DELETE SET NULL
);

-- Location
CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    altitude DECIMAL(9, 2),
    reference TEXT
);

-- Incident Types
CREATE TABLE incident_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Incident Status
CREATE TABLE incident_status (
    id SERIAL PRIMARY KEY,
    name incident_status_enum NOT NULL
);

-- Incidents
CREATE TABLE incident (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150),
    description TEXT,
    image_url TEXT,
    priority priority_enum,
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    close_date TIMESTAMP,
    status_id INT REFERENCES incident_status (id) ON DELETE SET NULL,
    user_id INT REFERENCES app_user (id) ON DELETE SET NULL,
    type_id INT REFERENCES incident_type (id) ON DELETE SET NULL,
    location_id INT REFERENCES location (id) ON DELETE SET NULL
);

-- Incident History
CREATE TABLE incident_history (
    id SERIAL PRIMARY KEY,
    incident_id INT REFERENCES incident (id) ON DELETE CASCADE,
    previous_status VARCHAR(100),
    new_status VARCHAR(100),
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comment TEXT,
    modified_by INT REFERENCES app_user (id) ON DELETE SET NULL
);

-- Notifications
CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES app_user (id) ON DELETE CASCADE,
    receiver_id INT REFERENCES app_user (id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial role seeds
INSERT INTO
    user_role (name)
VALUES ('user'),
    ('admin'),
    ('superadmin');

-- Initial status seeds
INSERT INTO
    incident_status (name)
VALUES ('pending'),
    ('in_progress'),
    ('resolved'),
    ('closed'),
    ('reopened');

-- =============================================
-- SELECT queries for Incident Reporting System
-- =============================================

-- 1. Select all users
SELECT * FROM app_user;

-- 2. Select all user roles
SELECT * FROM user_role;

-- 3. Select all incident types
SELECT * FROM incident_type;

-- 4. Select all incident statuses
SELECT * FROM incident_status;

-- 5. Select all locations
SELECT * FROM location;

-- 6. Select all incidents
SELECT * FROM incident;

-- 7. Select all incident history entries
SELECT * FROM incident_history;

-- 8. Select all notifications
SELECT * FROM notification;

-- 9. Full incident details with joins
SELECT
    i.id,
    i.title,
    i.description,
    i.priority,
    i.report_date,
    u.first_name || ' ' || u.last_name AS reported_by,
    it.name AS incident_type,
    s.name AS status
FROM
    incident i
    JOIN app_user u ON i.user_id = u.id
    JOIN incident_type it ON i.type_id = it.id
    JOIN incident_status s ON i.status_id = s.id
ORDER BY i.report_date DESC;

--10. Incident Full Details

-- Full incident details with complete timeline and user info
SELECT
    i.id AS incident_id,
    i.title,
    i.description,
    i.priority,
    i.report_date,
    i.assigned_date,
    i.in_progress_date,
    i.resolved_date,
    i.closed_date,
    u.first_name || ' ' || u.last_name AS reported_by,
    u.email AS user_email,
    it.name AS incident_type,
    s.name AS status,
    l.latitude,
    l.longitude,
    l.altitude,
    l.reference AS location_reference
FROM
    incident i
    LEFT JOIN app_user u ON i.user_id = u.id
    LEFT JOIN incident_type it ON i.type_id = it.id
    LEFT JOIN incident_status s ON i.status_id = s.id
    LEFT JOIN location l ON i.location_id = l.id
ORDER BY i.report_date DESC;

