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

-- Seed Initial Data from local DB
INSERT INTO events (id, title, date, description, location, status, duration_minutes, blackout_minutes, started_at, ended_at, is_confirmed_over)
VALUES 
    (0, 'Event Title', '2023-09-20', NULL, NULL, 'FINISHED', 120, 30, '2026-08-27T23:01:46.038Z', '2026-08-27T23:08:54.195Z', true),
    (1, 'DM i Skills 2024', '2024-04-18', NULL, NULL, 'CREATED', 120, 30, NULL, NULL, false),
    (2, 'Regionsmesterskab 2024', '2024-05-12', NULL, NULL, 'CREATED', 120, 30, NULL, NULL, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, type, username, password, team_id, station_id)
VALUES
    (0, 'ORGANIZER', 'organizer', 'password123', NULL, NULL),
    (1, 'POST_GUARD', 'post_guard', 'password123', NULL, 0),
    (2, 'TEAM', '8a_hold1', 'password123', 0, NULL),
    (3, 'TEAM', '8a_hold2', 'password123', 1, NULL),
    (4, 'TEAM', '9b_alpha', 'password123', 2, NULL),
    (5, 'TEAM', '10tek_skills', 'password123', 3, NULL),
    (6, 'TEAM', 'webh_hold1', 'zd9wjz', 4, NULL),
    (7, 'TEAM', 'webh_hold2', 'tgevqn', 5, NULL),
    (8, 'TEAM', 'webh_hold3', 'b3b652', 6, NULL),
    (9, 'TEAM', 'webh_hold4', 'k265u6', 7, NULL),
    (10, 'TEAM', 'webh_hold5', 'npwahr', 8, NULL),
    (11, 'TEAM', 'webh_hold6', 'p8chnk', 9, NULL),
    (12, 'TEAM', 'webh_hold7', 'tch9n4', 10, NULL),
    (13, 'TEAM', 'webh_hold8', 'qz2t4c', 11, NULL),
    (14, 'POST_GUARD', 'post_elektriker', 'password123', NULL, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, event_id, name, school, teacher_name)
VALUES
    (0, 0, '8.A', 'Vestskolen', 'Flemming Jensen'),
    (1, 0, '9.B', 'Østerhøj Skole', 'Mette Hansen'),
    (2, 1, '10. Teknisk', 'Vestskolen', 'Lars Nielsen'),
    (3, 1, 'Test klasse', 'Viden djurs', NULL),
    (4, 1, 'Webh', 'Viden djurs', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO teams (id, event_id, class_id, account_id, name, image, is_configured)
VALUES
    (0, 0, 0, 2, 'Hold 1 (De Hurtige)', NULL, true),
    (1, 0, 0, 3, 'Hold 2 (Byggemestrene)', NULL, true),
    (2, 0, 1, 4, 'Hold Alpha', NULL, true),
    (3, 1, 2, 5, 'Skills Champion Team', NULL, true),
    (4, 1, 4, 6, 'Hold 1', NULL, false),
    (5, 1, 4, 7, 'Hold 2', NULL, false),
    (6, 1, 4, 8, 'Hold 3', NULL, false),
    (7, 1, 4, 9, 'Hold 4', NULL, false),
    (8, 1, 4, 10, 'Hold 5', NULL, false),
    (9, 1, 4, 11, 'Hold 6', NULL, false),
    (10, 1, 4, 12, 'Hold 7', NULL, false),
    (11, 1, 4, 13, 'Hold 8', NULL, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stations (id, event_id, account_id, name, location, description)
VALUES
    (0, 0, 1, 'Station 1 - Tømrer & Savning', 'Værksted 1 (Hal A)', 'Holdet skal hurtigst muligt opmåle og tilskære tre stykker tømmer efter specifikke mål.'),
    (1, 0, 14, 'Station 2 - Elektriker & Kredsløb', 'Tekniklokale 3', 'Korrekt montering af afbryder og lyskilde.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO station_times (id, event_id, station_id, team_id, time_seconds, points, completed_at)
VALUES
    (1, 0, 0, 1, 178, NULL, '2024-04-18T10:30:00.000Z'),
    (2, 0, 0, 0, 3360, NULL, '2026-08-28T06:52:57.288Z')
ON CONFLICT (id) DO NOTHING;

-- Synchronize sequences with max IDs
SELECT setval(pg_get_serial_sequence('events', 'id'), COALESCE((SELECT MAX(id) + 1 FROM events), 1), false);
SELECT setval(pg_get_serial_sequence('accounts', 'id'), COALESCE((SELECT MAX(id) + 1 FROM accounts), 1), false);
SELECT setval(pg_get_serial_sequence('classes', 'id'), COALESCE((SELECT MAX(id) + 1 FROM classes), 1), false);
SELECT setval(pg_get_serial_sequence('teams', 'id'), COALESCE((SELECT MAX(id) + 1 FROM teams), 1), false);
SELECT setval(pg_get_serial_sequence('stations', 'id'), COALESCE((SELECT MAX(id) + 1 FROM stations), 1), false);
SELECT setval(pg_get_serial_sequence('station_times', 'id'), COALESCE((SELECT MAX(id) + 1 FROM station_times), 1), false);
