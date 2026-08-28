import { EventModel, CreateEventDTO, UpdateEventDTO } from "@/models/EventModel";
import {
	AccountModel,
	AccountType,
	CreateAccountDTO,
	UpdateAccountDTO,
} from "@/models/AccountModel";
import {
	ClassModel,
	CreateClassDTO,
	UpdateClassDTO,
} from "@/models/ClassModel";
import {
	TeamModel,
	CreateTeamDTO,
	UpdateTeamDTO,
} from "@/models/TeamModel";
import {
	StationModel,
	CreateStationDTO,
	UpdateStationDTO,
	StationTimeModel,
	CreateStationTimeDTO,
	UpdateStationTimeDTO,
} from "@/models/StationModel";
import { pool, ensureDatabaseReady } from "./pgPool";

function generateRandomPassword(): string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < 6; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/æ/g, "ae")
		.replace(/ø/g, "oe")
		.replace(/å/g, "aa")
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
}

// ---------------- EVENTS ----------------
export async function getEvents(search?: string): Promise<EventModel[]> {
	await ensureDatabaseReady();
	if (!search) {
		const res = await pool.query<EventModel>(
			`SELECT id, title, date, description, location, status,
			        duration_minutes AS "durationMinutes",
			        blackout_minutes AS "blackoutMinutes",
			        started_at AS "startedAt",
			        ended_at AS "endedAt",
			        is_confirmed_over AS "isConfirmedOver"
			 FROM events ORDER BY id ASC`
		);
		return res.rows;
	}

	const query = `%${search.toLowerCase().trim()}%`;
	const res = await pool.query<EventModel>(
		`SELECT id, title, date, description, location, status,
		        duration_minutes AS "durationMinutes",
		        blackout_minutes AS "blackoutMinutes",
		        started_at AS "startedAt",
		        ended_at AS "endedAt",
		        is_confirmed_over AS "isConfirmedOver"
		 FROM events
		 WHERE LOWER(title) LIKE $1
		    OR LOWER(date) LIKE $1
		    OR LOWER(COALESCE(location, '')) LIKE $1
		    OR LOWER(COALESCE(description, '')) LIKE $1
		 ORDER BY id ASC`,
		[query]
	);
	return res.rows;
}

export async function getEventById(id: number): Promise<EventModel | null> {
	await ensureDatabaseReady();
	const res = await pool.query<EventModel>(
		`SELECT id, title, date, description, location, status,
		        duration_minutes AS "durationMinutes",
		        blackout_minutes AS "blackoutMinutes",
		        started_at AS "startedAt",
		        ended_at AS "endedAt",
		        is_confirmed_over AS "isConfirmedOver"
		 FROM events WHERE id = $1`,
		[id]
	);
	return res.rows[0] ?? null;
}

export async function createEvent(data: CreateEventDTO): Promise<EventModel> {
	await ensureDatabaseReady();
	const trimmedTitle = data.title?.trim();
	if (!trimmedTitle) {
		throw new Error("Event titel er påkrævet");
	}
	if (!data.date) {
		throw new Error("Dato er påkrævet");
	}

	const res = await pool.query<EventModel>(
		`INSERT INTO events (title, date, location, description, status, duration_minutes, blackout_minutes, started_at, ended_at, is_confirmed_over)
		 VALUES ($1, $2, $3, $4, 'CREATED', $5, $6, NULL, NULL, FALSE)
		 RETURNING id, title, date, description, location, status,
		           duration_minutes AS "durationMinutes",
		           blackout_minutes AS "blackoutMinutes",
		           started_at AS "startedAt",
		           ended_at AS "endedAt",
		           is_confirmed_over AS "isConfirmedOver"`,
		[
			trimmedTitle,
			data.date,
			data.location?.trim() || null,
			data.description?.trim() || null,
			data.durationMinutes || 120,
			data.blackoutMinutes !== undefined ? data.blackoutMinutes : 30,
		]
	);
	return res.rows[0];
}

export async function updateEvent(
	id: number,
	data: UpdateEventDTO
): Promise<EventModel> {
	await ensureDatabaseReady();
	const existing = await getEventById(id);
	if (!existing) {
		throw new Error(`Event med id ${id} blev ikke fundet`);
	}

	if (data.title !== undefined) {
		const trimmed = data.title.trim();
		if (!trimmed) throw new Error("Event titel må ikke være tom");
		existing.title = trimmed;
	}
	if (data.date !== undefined) {
		if (!data.date) throw new Error("Dato må ikke være tom");
		existing.date = data.date;
	}
	if (data.location !== undefined) {
		existing.location = data.location.trim() || undefined;
	}
	if (data.description !== undefined) {
		existing.description = data.description.trim() || undefined;
	}
	if (data.status !== undefined) {
		existing.status = data.status;
	}
	if (data.durationMinutes !== undefined) {
		existing.durationMinutes = data.durationMinutes;
	}
	if (data.blackoutMinutes !== undefined) {
		existing.blackoutMinutes = data.blackoutMinutes;
	}
	if (data.startedAt !== undefined) {
		existing.startedAt = data.startedAt;
	}
	if (data.endedAt !== undefined) {
		existing.endedAt = data.endedAt;
	}
	if (data.isConfirmedOver !== undefined) {
		existing.isConfirmedOver = data.isConfirmedOver;
	}

	const res = await pool.query<EventModel>(
		`UPDATE events
		 SET title = $1, date = $2, location = $3, description = $4, status = $5,
		     duration_minutes = $6, blackout_minutes = $7, started_at = $8, ended_at = $9, is_confirmed_over = $10
		 WHERE id = $11
		 RETURNING id, title, date, description, location, status,
		           duration_minutes AS "durationMinutes",
		           blackout_minutes AS "blackoutMinutes",
		           started_at AS "startedAt",
		           ended_at AS "endedAt",
		           is_confirmed_over AS "isConfirmedOver"`,
		[
			existing.title,
			existing.date,
			existing.location || null,
			existing.description || null,
			existing.status || "CREATED",
			existing.durationMinutes || 120,
			existing.blackoutMinutes !== undefined ? existing.blackoutMinutes : 30,
			existing.startedAt || null,
			existing.endedAt || null,
			existing.isConfirmedOver || false,
			id,
		]
	);

	return res.rows[0];
}

export async function deleteEvent(id: number): Promise<boolean> {
	await ensureDatabaseReady();
	const existing = await getEventById(id);
	if (!existing) {
		throw new Error(`Event med id ${id} blev ikke fundet`);
	}

	// Delete related accounts for teams and stations under this event
	await pool.query(
		`DELETE FROM accounts
		 WHERE id IN (
		     SELECT account_id FROM teams WHERE event_id = $1 AND account_id IS NOT NULL
		     UNION
		     SELECT account_id FROM stations WHERE event_id = $1 AND account_id IS NOT NULL
		 )`,
		[id]
	);

	// Cascade delete handles classes, teams, stations, station_times
	await pool.query("DELETE FROM events WHERE id = $1", [id]);
	return true;
}

// ---------------- ACCOUNTS ----------------
export async function getAccounts(
	search?: string,
	type?: AccountType
): Promise<AccountModel[]> {
	await ensureDatabaseReady();
	const conditions: string[] = [];
	const params: unknown[] = [];

	if (type) {
		params.push(type);
		conditions.push(`type = $${params.length}`);
	}

	if (search) {
		params.push(`%${search.toLowerCase().trim()}%`);
		conditions.push(`LOWER(username) LIKE $${params.length}`);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const res = await pool.query<AccountModel>(
		`SELECT id, type, username, password, team_id AS "teamId", station_id AS "stationId"
		 FROM accounts
		 ${whereClause}
		 ORDER BY id ASC`,
		params
	);
	return res.rows;
}

export async function getAccountById(id: number): Promise<AccountModel | null> {
	await ensureDatabaseReady();
	const res = await pool.query<AccountModel>(
		`SELECT id, type, username, password, team_id AS "teamId", station_id AS "stationId"
		 FROM accounts WHERE id = $1`,
		[id]
	);
	return res.rows[0] ?? null;
}

export async function createAccount(data: CreateAccountDTO): Promise<AccountModel> {
	await ensureDatabaseReady();
	const trimmedUsername = data.username?.trim();
	if (!trimmedUsername) {
		throw new Error("Brugernavn er påkrævet");
	}

	const existing = await pool.query(
		"SELECT id FROM accounts WHERE LOWER(username) = LOWER($1)",
		[trimmedUsername]
	);
	if (existing.rows.length > 0) {
		throw new Error(`En konto med brugernavnet "${trimmedUsername}" findes allerede`);
	}

	const password = data.password?.trim() || generateRandomPassword();
	const res = await pool.query<AccountModel>(
		`INSERT INTO accounts (type, username, password, team_id, station_id)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, type, username, password, team_id AS "teamId", station_id AS "stationId"`,
		[data.type, trimmedUsername, password, data.teamId ?? null, data.stationId ?? null]
	);
	return res.rows[0];
}

export async function updateAccount(
	id: number,
	data: UpdateAccountDTO
): Promise<AccountModel> {
	await ensureDatabaseReady();
	const existing = await getAccountById(id);
	if (!existing) {
		throw new Error(`Konto med id ${id} blev ikke fundet`);
	}

	let username = existing.username;
	if (data.username !== undefined) {
		const trimmed = data.username.trim();
		if (!trimmed) throw new Error("Brugernavn må ikke være tomt");
		const check = await pool.query(
			"SELECT id FROM accounts WHERE LOWER(username) = LOWER($1) AND id <> $2",
			[trimmed, id]
		);
		if (check.rows.length > 0) {
			throw new Error(`En konto med brugernavnet "${trimmed}" findes allerede`);
		}
		username = trimmed;
	}

	let password = existing.password;
	if (data.password !== undefined) {
		const trimmed = data.password.trim();
		if (!trimmed) throw new Error("Adgangskode må ikke være tom");
		password = trimmed;
	}

	const type = data.type !== undefined ? data.type : existing.type;
	const teamId = data.teamId !== undefined ? data.teamId : existing.teamId;
	const stationId = data.stationId !== undefined ? data.stationId : existing.stationId;

	const res = await pool.query<AccountModel>(
		`UPDATE accounts
		 SET type = $1, username = $2, password = $3, team_id = $4, station_id = $5
		 WHERE id = $6
		 RETURNING id, type, username, password, team_id AS "teamId", station_id AS "stationId"`,
		[type, username, password, teamId ?? null, stationId ?? null, id]
	);
	return res.rows[0];
}

export async function deleteAccount(id: number): Promise<boolean> {
	await ensureDatabaseReady();
	const existing = await getAccountById(id);
	if (!existing) {
		throw new Error(`Konto med id ${id} blev ikke fundet`);
	}
	await pool.query("DELETE FROM accounts WHERE id = $1", [id]);
	return true;
}

// ---------------- CLASSES ----------------
export async function getClasses(
	eventId?: number,
	search?: string
): Promise<ClassModel[]> {
	await ensureDatabaseReady();
	const conditions: string[] = [];
	const params: unknown[] = [];

	if (eventId !== undefined) {
		params.push(eventId);
		conditions.push(`event_id = $${params.length}`);
	}

	if (search) {
		params.push(`%${search.toLowerCase().trim()}%`);
		conditions.push(`(LOWER(name) LIKE $${params.length} OR LOWER(school) LIKE $${params.length})`);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const res = await pool.query<ClassModel>(
		`SELECT id, event_id AS "eventId", name, school, teacher_name AS "teacherName"
		 FROM classes
		 ${whereClause}
		 ORDER BY id ASC`,
		params
	);
	return res.rows;
}

export async function getClassById(id: number): Promise<ClassModel | null> {
	await ensureDatabaseReady();
	const res = await pool.query<ClassModel>(
		`SELECT id, event_id AS "eventId", name, school, teacher_name AS "teacherName"
		 FROM classes WHERE id = $1`,
		[id]
	);
	return res.rows[0] ?? null;
}

export async function createClass(data: CreateClassDTO): Promise<ClassModel> {
	await ensureDatabaseReady();
	const trimmedName = data.name?.trim();
	const trimmedSchool = data.school?.trim();
	if (!trimmedName) throw new Error("Klassenavn er påkrævet");
	if (!trimmedSchool) throw new Error("Skole er påkrævet");

	const res = await pool.query<ClassModel>(
		`INSERT INTO classes (event_id, name, school, teacher_name)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, event_id AS "eventId", name, school, teacher_name AS "teacherName"`,
		[data.eventId, trimmedName, trimmedSchool, data.teacherName?.trim() || null]
	);
	const newClass = res.rows[0];

	// Auto-generate teams & accounts if initialTeamsCount / teamCount provided
	const count = data.teamCount || data.initialTeamsCount || 0;
	for (let i = 1; i <= count; i++) {
		const teamName = `Hold ${i}`;
		const password = generateRandomPassword();

		// Create team account
		const accRes = await pool.query<AccountModel>(
			`INSERT INTO accounts (type, username, password)
			 VALUES ('TEAM', $1, $2)
			 RETURNING id, type, username, password, team_id AS "teamId", station_id AS "stationId"`,
			[`${slugify(trimmedName)}_hold_${i}_${Date.now()}_${i}`, password]
		);
		const account = accRes.rows[0];

		// Create team
		const teamRes = await pool.query<TeamModel>(
			`INSERT INTO teams (event_id, class_id, account_id, name, is_configured)
			 VALUES ($1, $2, $3, $4, FALSE)
			 RETURNING id, event_id AS "eventId", class_id AS "classId", account_id AS "accountId", name, image, is_configured AS "isConfigured"`,
			[data.eventId, newClass.id, account.id, teamName]
		);
		const team = teamRes.rows[0];

		// Update account with teamId and refined username
		const finalUsername = `${slugify(trimmedName)}_hold_${i}_${team.id}`;
		await pool.query(
			`UPDATE accounts SET username = $1, team_id = $2 WHERE id = $3`,
			[finalUsername, team.id, account.id]
		);
	}

	return newClass;
}

export async function updateClass(
	id: number,
	data: UpdateClassDTO
): Promise<ClassModel> {
	await ensureDatabaseReady();
	const existing = await getClassById(id);
	if (!existing) {
		throw new Error(`Klasse med id ${id} blev ikke fundet`);
	}

	let name = existing.name;
	if (data.name !== undefined) {
		const trimmed = data.name.trim();
		if (!trimmed) throw new Error("Klassenavn må ikke være tomt");
		name = trimmed;
	}

	let school = existing.school;
	if (data.school !== undefined) {
		const trimmed = data.school.trim();
		if (!trimmed) throw new Error("Skole må ikke være tom");
		school = trimmed;
	}

	const teacherName = data.teacherName !== undefined ? data.teacherName.trim() || null : (existing.teacherName || null);

	const res = await pool.query<ClassModel>(
		`UPDATE classes
		 SET name = $1, school = $2, teacher_name = $3
		 WHERE id = $4
		 RETURNING id, event_id AS "eventId", name, school, teacher_name AS "teacherName"`,
		[name, school, teacherName, id]
	);
	return res.rows[0];
}

export async function deleteClass(id: number): Promise<boolean> {
	await ensureDatabaseReady();
	const existing = await getClassById(id);
	if (!existing) {
		throw new Error(`Klasse med id ${id} blev ikke fundet`);
	}

	// Delete accounts of teams in this class
	await pool.query(
		`DELETE FROM accounts
		 WHERE id IN (SELECT account_id FROM teams WHERE class_id = $1 AND account_id IS NOT NULL)`,
		[id]
	);

	await pool.query("DELETE FROM classes WHERE id = $1", [id]);
	return true;
}

export async function getUniqueSchools(eventId?: number): Promise<string[]> {
	await ensureDatabaseReady();
	const res = await pool.query<{ school: string }>(
		`SELECT DISTINCT school
		 FROM classes
		 WHERE ($1::int IS NULL OR event_id = $1)
		   AND school IS NOT NULL AND school <> ''
		 ORDER BY school ASC`,
		[eventId ?? null]
	);
	return res.rows.map((r) => r.school);
}

// ---------------- TEAMS ----------------
export async function getTeams(
	eventId?: number,
	classId?: number,
	search?: string
): Promise<TeamModel[]> {
	await ensureDatabaseReady();
	const conditions: string[] = [];
	const params: unknown[] = [];

	if (eventId !== undefined) {
		params.push(eventId);
		conditions.push(`event_id = $${params.length}`);
	}

	if (classId !== undefined) {
		params.push(classId);
		conditions.push(`class_id = $${params.length}`);
	}

	if (search) {
		params.push(`%${search.toLowerCase().trim()}%`);
		conditions.push(`LOWER(name) LIKE $${params.length}`);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const res = await pool.query<TeamModel>(
		`SELECT id, event_id AS "eventId", class_id AS "classId", account_id AS "accountId",
		        name, image, is_configured AS "isConfigured"
		 FROM teams
		 ${whereClause}
		 ORDER BY id ASC`,
		params
	);
	return res.rows;
}

export async function getTeamById(id: number): Promise<TeamModel | null> {
	await ensureDatabaseReady();
	const res = await pool.query<TeamModel>(
		`SELECT id, event_id AS "eventId", class_id AS "classId", account_id AS "accountId",
		        name, image, is_configured AS "isConfigured"
		 FROM teams WHERE id = $1`,
		[id]
	);
	return res.rows[0] ?? null;
}

export async function createTeam(data: CreateTeamDTO): Promise<TeamModel> {
	await ensureDatabaseReady();
	const trimmedName = data.name?.trim();
	if (!trimmedName) throw new Error("Holdnavn er påkrævet");

	const tempUsername = data.username?.trim() || `${slugify(trimmedName)}_${Date.now()}`;
	const password = data.password?.trim() || generateRandomPassword();

	// Create account
	const accRes = await pool.query<AccountModel>(
		`INSERT INTO accounts (type, username, password)
		 VALUES ('TEAM', $1, $2)
		 RETURNING id`,
		[tempUsername, password]
	);
	const accountId = accRes.rows[0].id;

	// Create team
	const teamRes = await pool.query<TeamModel>(
		`INSERT INTO teams (event_id, class_id, account_id, name, image, is_configured)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, event_id AS "eventId", class_id AS "classId", account_id AS "accountId",
		           name, image, is_configured AS "isConfigured"`,
		[
			data.eventId,
			data.classId,
			accountId,
			trimmedName,
			data.image || null,
			data.isConfigured || false,
		]
	);
	const team = teamRes.rows[0];

	// Update account with final teamId and username if needed
	const finalUsername = data.username?.trim() || `${slugify(trimmedName)}_${team.id}`;
	await pool.query(
		`UPDATE accounts SET username = $1, team_id = $2 WHERE id = $3`,
		[finalUsername, team.id, accountId]
	);

	return team;
}

export async function updateTeam(
	id: number,
	data: UpdateTeamDTO
): Promise<TeamModel> {
	await ensureDatabaseReady();
	const existing = await getTeamById(id);
	if (!existing) {
		throw new Error(`Hold med id ${id} blev ikke fundet`);
	}

	let name = existing.name;
	if (data.name !== undefined) {
		const trimmed = data.name.trim();
		if (!trimmed) throw new Error("Holdnavn må ikke være tomt");
		name = trimmed;
	}

	const classId = data.classId !== undefined ? data.classId : existing.classId;
	const image = data.image !== undefined ? (data.image || null) : (existing.image || null);
	const isConfigured = data.isConfigured !== undefined ? data.isConfigured : (existing.isConfigured || false);

	const res = await pool.query<TeamModel>(
		`UPDATE teams
		 SET name = $1, class_id = $2, image = $3, is_configured = $4
		 WHERE id = $5
		 RETURNING id, event_id AS "eventId", class_id AS "classId", account_id AS "accountId",
		           name, image, is_configured AS "isConfigured"`,
		[name, classId, image, isConfigured, id]
	);
	return res.rows[0];
}

export async function deleteTeam(id: number): Promise<boolean> {
	await ensureDatabaseReady();
	const existing = await getTeamById(id);
	if (!existing) {
		throw new Error(`Hold med id ${id} blev ikke fundet`);
	}

	// Delete team account if exists
	if (existing.accountId) {
		await pool.query("DELETE FROM accounts WHERE id = $1", [existing.accountId]);
	}

	await pool.query("DELETE FROM teams WHERE id = $1", [id]);
	return true;
}

// ---------------- STATIONS ----------------
export async function getStations(
	eventId?: number,
	search?: string
): Promise<StationModel[]> {
	await ensureDatabaseReady();
	const conditions: string[] = [];
	const params: unknown[] = [];

	if (eventId !== undefined) {
		params.push(eventId);
		conditions.push(`event_id = $${params.length}`);
	}

	if (search) {
		params.push(`%${search.toLowerCase().trim()}%`);
		conditions.push(
			`(LOWER(name) LIKE $${params.length} OR LOWER(COALESCE(location, '')) LIKE $${params.length} OR LOWER(COALESCE(description, '')) LIKE $${params.length})`
		);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const res = await pool.query<StationModel>(
		`SELECT id, event_id AS "eventId", account_id AS "accountId", name, location, description
		 FROM stations
		 ${whereClause}
		 ORDER BY id ASC`,
		params
	);
	return res.rows;
}

export async function getStationById(id: number): Promise<StationModel | null> {
	await ensureDatabaseReady();
	const res = await pool.query<StationModel>(
		`SELECT id, event_id AS "eventId", account_id AS "accountId", name, location, description
		 FROM stations WHERE id = $1`,
		[id]
	);
	return res.rows[0] ?? null;
}

export async function createStation(data: CreateStationDTO): Promise<StationModel> {
	await ensureDatabaseReady();
	const trimmedName = data.name?.trim();
	if (!trimmedName) throw new Error("Stationsnavn er påkrævet");

	const tempUsername = data.username?.trim() || `post_${slugify(trimmedName)}_${Date.now()}`;
	const password = data.password?.trim() || generateRandomPassword();

	// Create post guard account
	const accRes = await pool.query<AccountModel>(
		`INSERT INTO accounts (type, username, password)
		 VALUES ('POST_GUARD', $1, $2)
		 RETURNING id`,
		[tempUsername, password]
	);
	const accountId = accRes.rows[0].id;

	// Create station
	const stRes = await pool.query<StationModel>(
		`INSERT INTO stations (event_id, account_id, name, location, description)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, event_id AS "eventId", account_id AS "accountId", name, location, description`,
		[
			data.eventId,
			accountId,
			trimmedName,
			data.location?.trim() || null,
			data.description?.trim() || null,
		]
	);
	const station = stRes.rows[0];

	// Update account with final stationId and username
	const finalUsername = data.username?.trim() || `post_${slugify(trimmedName)}_${station.id}`;
	await pool.query(
		`UPDATE accounts SET username = $1, station_id = $2 WHERE id = $3`,
		[finalUsername, station.id, accountId]
	);

	return station;
}

export async function updateStation(
	id: number,
	data: UpdateStationDTO
): Promise<StationModel> {
	await ensureDatabaseReady();
	const existing = await getStationById(id);
	if (!existing) {
		throw new Error(`Station med id ${id} blev ikke fundet`);
	}

	let name = existing.name;
	if (data.name !== undefined) {
		const trimmed = data.name.trim();
		if (!trimmed) throw new Error("Stationsnavn må ikke være tomt");
		name = trimmed;
	}

	const location = data.location !== undefined ? data.location.trim() || null : (existing.location || null);
	const description = data.description !== undefined ? data.description.trim() || null : (existing.description || null);

	const res = await pool.query<StationModel>(
		`UPDATE stations
		 SET name = $1, location = $2, description = $3
		 WHERE id = $4
		 RETURNING id, event_id AS "eventId", account_id AS "accountId", name, location, description`,
		[name, location, description, id]
	);
	return res.rows[0];
}

export async function deleteStation(id: number): Promise<boolean> {
	await ensureDatabaseReady();
	const existing = await getStationById(id);
	if (!existing) {
		throw new Error(`Station med id ${id} blev ikke fundet`);
	}

	// Delete station account if exists
	if (existing.accountId) {
		await pool.query("DELETE FROM accounts WHERE id = $1", [existing.accountId]);
	}

	await pool.query("DELETE FROM stations WHERE id = $1", [id]);
	return true;
}

// ---------------- STATION TIMES ----------------
export async function getStationTimes(filter?: {
	eventId?: number;
	stationId?: number;
	teamId?: number;
}): Promise<StationTimeModel[]> {
	await ensureDatabaseReady();
	const conditions: string[] = [];
	const params: unknown[] = [];

	if (filter?.eventId !== undefined) {
		params.push(filter.eventId);
		conditions.push(`event_id = $${params.length}`);
	}
	if (filter?.stationId !== undefined) {
		params.push(filter.stationId);
		conditions.push(`station_id = $${params.length}`);
	}
	if (filter?.teamId !== undefined) {
		params.push(filter.teamId);
		conditions.push(`team_id = $${params.length}`);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const res = await pool.query<StationTimeModel>(
		`SELECT id, event_id AS "eventId", station_id AS "stationId", team_id AS "teamId",
		        time_seconds AS "timeSeconds", points, completed_at AS "completedAt"
		 FROM station_times
		 ${whereClause}
		 ORDER BY id ASC`,
		params
	);
	return res.rows;
}

export async function getStationTimeById(
	id: number
): Promise<StationTimeModel | null> {
	await ensureDatabaseReady();
	const res = await pool.query<StationTimeModel>(
		`SELECT id, event_id AS "eventId", station_id AS "stationId", team_id AS "teamId",
		        time_seconds AS "timeSeconds", points, completed_at AS "completedAt"
		 FROM station_times WHERE id = $1`,
		[id]
	);
	return res.rows[0] ?? null;
}

export async function createStationTime(
	data: CreateStationTimeDTO
): Promise<StationTimeModel> {
	await ensureDatabaseReady();
	const completedAt = data.completedAt || new Date().toISOString();
	const res = await pool.query<StationTimeModel>(
		`INSERT INTO station_times (event_id, station_id, team_id, time_seconds, points, completed_at)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, event_id AS "eventId", station_id AS "stationId", team_id AS "teamId",
		           time_seconds AS "timeSeconds", points, completed_at AS "completedAt"`,
		[
			data.eventId,
			data.stationId,
			data.teamId,
			data.timeSeconds,
			data.points ?? null,
			completedAt,
		]
	);
	return res.rows[0];
}

export async function updateStationTime(
	id: number,
	data: UpdateStationTimeDTO
): Promise<StationTimeModel> {
	await ensureDatabaseReady();
	const existing = await getStationTimeById(id);
	if (!existing) {
		throw new Error(`Tidsregistrering med id ${id} blev ikke fundet`);
	}

	const teamId = data.teamId !== undefined ? data.teamId : existing.teamId;
	const timeSeconds = data.timeSeconds !== undefined ? data.timeSeconds : existing.timeSeconds;
	const points = data.points !== undefined ? (data.points ?? null) : (existing.points ?? null);
	const completedAt = data.completedAt !== undefined ? data.completedAt : existing.completedAt;

	const res = await pool.query<StationTimeModel>(
		`UPDATE station_times
		 SET team_id = $1, time_seconds = $2, points = $3, completed_at = $4
		 WHERE id = $5
		 RETURNING id, event_id AS "eventId", station_id AS "stationId", team_id AS "teamId",
		           time_seconds AS "timeSeconds", points, completed_at AS "completedAt"`,
		[teamId, timeSeconds, points, completedAt, id]
	);
	return res.rows[0];
}

export async function deleteStationTime(id: number): Promise<boolean> {
	await ensureDatabaseReady();
	const existing = await getStationTimeById(id);
	if (!existing) {
		throw new Error(`Tidsregistrering med id ${id} blev ikke fundet`);
	}
	await pool.query("DELETE FROM station_times WHERE id = $1", [id]);
	return true;
}
