import { Pool } from "pg";

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
		connectionTimeoutMillis: 10000,
	});

if (process.env.NODE_ENV !== "production") {
	globalForPg.pgPool = pool;
}

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDatabaseName(connStr: string): string {
	try {
		const parsed = new URL(connStr);
		return parsed.pathname.replace(/^\//, "") || "skills_competition";
	} catch {
		return process.env.POSTGRES_DB || "skills_competition";
	}
}

function getMaintenanceConnectionString(connStr: string): string {
	try {
		const parsed = new URL(connStr);
		parsed.pathname = "/postgres";
		return parsed.toString();
	} catch {
		return `postgresql://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD || "postgres"}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/postgres`;
	}
}

async function createDatabaseIfNotExists(): Promise<void> {
	const targetDb = getDatabaseName(connectionString);
	if (targetDb === "postgres") return;

	const maintenanceConnStr = getMaintenanceConnectionString(connectionString);
	const maintenancePool = new Pool({
		connectionString: maintenanceConnStr,
		connectionTimeoutMillis: 5000,
	});

	try {
		const checkRes = await maintenancePool.query(
			"SELECT 1 FROM pg_database WHERE datname = $1",
			[targetDb]
		);
		if (checkRes.rowCount === 0) {
			const safeDbName = targetDb.replace(/[^a-zA-Z0-9_]/g, "");
			await maintenancePool.query(`CREATE DATABASE "${safeDbName}"`);
			console.log(`Database "${safeDbName}" was created automatically.`);
		}
	} catch (err) {
		console.warn("Could not auto-create database via maintenance pool:", (err as Error).message);
	} finally {
		await maintenancePool.end().catch(() => {});
	}
}

export async function ensureDatabaseReady(): Promise<void> {
	if (globalForPg.isDbInitialized) {
		return globalForPg.isDbInitialized;
	}

	globalForPg.isDbInitialized = (async () => {
		let attempts = 0;
		const maxAttempts = 10;

		while (attempts < maxAttempts) {
			try {
				attempts++;

				// 1. Try to ensure the database itself exists
				if (attempts === 1) {
					await createDatabaseIfNotExists();
				}

				// 2. Create tables if they do not exist
				await pool.query(`
					CREATE TABLE IF NOT EXISTS events (\n						id SERIAL PRIMARY KEY,\n						title VARCHAR(255) NOT NULL,\n						date VARCHAR(255) NOT NULL,\n						description TEXT,\n						location VARCHAR(255),\n						status VARCHAR(50) DEFAULT 'CREATED',\n						duration_minutes INTEGER DEFAULT 120,\n						blackout_minutes INTEGER DEFAULT 30,\n						started_at VARCHAR(255),\n						ended_at VARCHAR(255),\n						is_confirmed_over BOOLEAN DEFAULT FALSE\n					);\n\n					CREATE TABLE IF NOT EXISTS accounts (\n						id SERIAL PRIMARY KEY,\n						type VARCHAR(50) NOT NULL,\n						username VARCHAR(255) NOT NULL UNIQUE,\n						password VARCHAR(255) NOT NULL,\n						team_id INTEGER,\n						station_id INTEGER\n					);\n\n					CREATE TABLE IF NOT EXISTS classes (\n						id SERIAL PRIMARY KEY,\n						event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,\n						name VARCHAR(255) NOT NULL,\n						school VARCHAR(255) NOT NULL,\n						teacher_name VARCHAR(255)\n					);\n\n					CREATE TABLE IF NOT EXISTS teams (\n						id SERIAL PRIMARY KEY,\n						event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,\n						class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,\n						account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,\n						name VARCHAR(255) NOT NULL,\n						image TEXT,\n						is_configured BOOLEAN DEFAULT FALSE\n					);\n\n					CREATE TABLE IF NOT EXISTS stations (\n						id SERIAL PRIMARY KEY,\n						event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,\n						account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,\n						name VARCHAR(255) NOT NULL,\n						location VARCHAR(255),\n						description TEXT\n					);\n\n					CREATE TABLE IF NOT EXISTS station_times (\n						id SERIAL PRIMARY KEY,\n						event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,\n						station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,\n						team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,\n						time_seconds INTEGER NOT NULL,\n						points INTEGER,\n						completed_at VARCHAR(255)\n					);\n				`);

				// 3. Ensure at least one default organizer account exists if accounts table is empty
				const { rows: organizerCountRows } = await pool.query(
					"SELECT COUNT(*) AS count FROM accounts WHERE type = 'ORGANIZER'"
				);
				const organizerCount = parseInt(organizerCountRows[0]?.count || "0", 10);
				if (organizerCount === 0) {
					await pool.query(`
						INSERT INTO accounts (type, username, password)
						VALUES ('ORGANIZER', 'organizer', 'password123')
						ON CONFLICT (username) DO NOTHING;
					`);
				}

				// Connection and table initialization succeeded
				return;
			} catch (err: unknown) {
				const error = err as { code?: string; message?: string };
				console.warn(
					`Database connection attempt ${attempts}/${maxAttempts} failed:`,
					error.message || error
				);

				// If database does not exist (Postgres error code 3D000), try creating it
				if (error.code === "3D000" || error.message?.includes("does not exist")) {
					await createDatabaseIfNotExists();
				}

				if (attempts >= maxAttempts) {
					globalForPg.isDbInitialized = undefined;
					throw err;
				}
				await sleep(2000);
			}
		}
	})();

	return globalForPg.isDbInitialized;
}
