import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";

const connectionString =
	process.env.DATABASE_URL ||
	`postgresql://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD || "postgres"}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/${process.env.POSTGRES_DB || "skills_competition"}`;

// Global pool instance for Next.js hot reload support in development
const globalForPg = globalThis as unknown as {
	pgPool: Pool | undefined;
	isDbInitialized: Promise<void> | undefined;
};

export const pool: Pool =
	globalForPg.pgPool ||
	new Pool({
		connectionString,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 5000,
	});

if (process.env.NODE_ENV !== "production") {
	globalForPg.pgPool = pool;
}

export async function ensureDatabaseReady(): Promise<void> {
	if (globalForPg.isDbInitialized) {
		return globalForPg.isDbInitialized;
	}

	globalForPg.isDbInitialized = (async () => {
		try {
			// Create tables if they do not exist
			await pool.query(`
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
			`);

			// Check if database needs initial seeding from local json
			const { rows: eventCountRows } = await pool.query("SELECT COUNT(*) AS count FROM events");
			const eventCount = parseInt(eventCountRows[0]?.count || "0", 10);

			if (eventCount === 0) {
				const localDbPath = path.join(process.cwd(), "src", "db.local.json");
				try {
					const raw = await fs.readFile(localDbPath, "utf-8");
					const data = JSON.parse(raw);

					// Seed events
					if (Array.isArray(data.events)) {
						for (const e of data.events) {
							await pool.query(
								`INSERT INTO events (id, title, date, description, location, status, duration_minutes, blackout_minutes, started_at, ended_at, is_confirmed_over)
								 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
								 ON CONFLICT (id) DO NOTHING`,
								[
									e.id,
									e.title,
									e.date,
									e.description || null,
									e.location || null,
									e.status || "CREATED",
									e.durationMinutes ?? 120,
									e.blackoutMinutes ?? 30,
									e.startedAt || null,
									e.endedAt || null,
									e.isConfirmedOver || false,
								]
							);
						}
					}

					// Seed accounts
					if (Array.isArray(data.accounts)) {
						for (const a of data.accounts) {
							await pool.query(
								`INSERT INTO accounts (id, type, username, password, team_id, station_id)
								 VALUES ($1, $2, $3, $4, $5, $6)
								 ON CONFLICT (id) DO NOTHING`,
								[a.id, a.type, a.username, a.password, a.teamId ?? null, a.stationId ?? null]
							);
						}
					}

					// Seed classes
					if (Array.isArray(data.classes)) {
						for (const c of data.classes) {
							await pool.query(
								`INSERT INTO classes (id, event_id, name, school, teacher_name)
								 VALUES ($1, $2, $3, $4, $5)
								 ON CONFLICT (id) DO NOTHING`,
								[c.id, c.eventId, c.name, c.school, c.teacherName || null]
							);
						}
					}

					// Seed teams
					if (Array.isArray(data.teams)) {
						for (const t of data.teams) {
							await pool.query(
								`INSERT INTO teams (id, event_id, class_id, account_id, name, image, is_configured)
								 VALUES ($1, $2, $3, $4, $5, $6, $7)
								 ON CONFLICT (id) DO NOTHING`,
								[t.id, t.eventId, t.classId, t.accountId ?? null, t.name, t.image || null, t.isConfigured || false]
							);
						}
					}

					// Seed stations
					if (Array.isArray(data.stations)) {
						for (const s of data.stations) {
							await pool.query(
								`INSERT INTO stations (id, event_id, account_id, name, location, description)
								 VALUES ($1, $2, $3, $4, $5, $6)
								 ON CONFLICT (id) DO NOTHING`,
								[s.id, s.eventId, s.accountId ?? null, s.name, s.location || null, s.description || null]
							);
						}
					}

					// Seed station times
					if (Array.isArray(data.stationTimes)) {
						for (const st of data.stationTimes) {
							await pool.query(
								`INSERT INTO station_times (id, event_id, station_id, team_id, time_seconds, points, completed_at)
								 VALUES ($1, $2, $3, $4, $5, $6, $7)
								 ON CONFLICT (id) DO NOTHING`,
								[st.id, st.eventId, st.stationId, st.teamId, st.timeSeconds, st.points ?? null, st.completedAt || null]
							);
						}
					}

					// Reset serial sequences to avoid collision with manually inserted IDs
					await pool.query(`
						SELECT setval(pg_get_serial_sequence('events', 'id'), COALESCE((SELECT MAX(id) + 1 FROM events), 1), false);
						SELECT setval(pg_get_serial_sequence('accounts', 'id'), COALESCE((SELECT MAX(id) + 1 FROM accounts), 1), false);
						SELECT setval(pg_get_serial_sequence('classes', 'id'), COALESCE((SELECT MAX(id) + 1 FROM classes), 1), false);
						SELECT setval(pg_get_serial_sequence('teams', 'id'), COALESCE((SELECT MAX(id) + 1 FROM teams), 1), false);
						SELECT setval(pg_get_serial_sequence('stations', 'id'), COALESCE((SELECT MAX(id) + 1 FROM stations), 1), false);
						SELECT setval(pg_get_serial_sequence('station_times', 'id'), COALESCE((SELECT MAX(id) + 1 FROM station_times), 1), false);
					`);
				} catch (fileErr) {
					console.warn("Could not seed from db.local.json:", fileErr);
				}
			}
		} catch (err) {
			console.error("Failed to initialize PostgreSQL schema:", err);
			// Reset in case of transient error so next query can retry
			globalForPg.isDbInitialized = undefined;
			throw err;
		}
	})();

	return globalForPg.isDbInitialized;
}
