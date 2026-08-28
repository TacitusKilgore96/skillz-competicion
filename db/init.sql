-- Initialize Skills Competition Database Schema

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'CREATED',
    duration_minutes INTEGER DEFAULT 120,
    blackout_minutes INTEGER DEFAULT 30,
    started_at VARCHAR(255),
    ended_at VARCHAR(255),
    is_confirmed_over BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    team_id INTEGER,
    station_id INTEGER
);

CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    school VARCHAR(255) NOT NULL,
    teacher_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    image TEXT,
    is_configured BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS stations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT
);

CREATE TABLE IF NOT EXISTS station_times (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    time_seconds INTEGER NOT NULL,
    points INTEGER,
    completed_at VARCHAR(255)
);

-- Default Admin Organizer Account
INSERT INTO accounts (type, username, password)
VALUES ('ORGANIZER', 'organizer', 'password123')
ON CONFLICT (username) DO NOTHING;
