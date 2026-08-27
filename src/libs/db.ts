import fs from "fs/promises";
import path from "path";
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

const DB_PATH = path.join(process.cwd(), "src", "db.local.json");

interface DatabaseSchema {
	events: EventModel[];
	accounts: AccountModel[];
	classes: ClassModel[];
	teams: TeamModel[];
	stations: StationModel[];
	stationTimes: StationTimeModel[];
}

const DEFAULT_DB: DatabaseSchema = {
	events: [
		{
			id: 0,
			title: "Event Title",
			date: "2023-09-20",
			status: "CREATED",
			durationMinutes: 120,
			blackoutMinutes: 30,
			startedAt: null,
			endedAt: null,
			isConfirmedOver: false,
		},
	],
	accounts: [],
	classes: [],
	teams: [],
	stations: [],
	stationTimes: [],
};

async function readDb(): Promise<DatabaseSchema> {
	try {
		const raw = await fs.readFile(DB_PATH, "utf-8");
		const parsed = JSON.parse(raw);
		return {
			events: parsed.events || [],
			accounts: parsed.accounts || [],
			classes: parsed.classes || [],
			teams: parsed.teams || [],
			stations: parsed.stations || [],
			stationTimes: parsed.stationTimes || [],
		};
	} catch (err: unknown) {
		console.error("Error reading database:", err);
		return DEFAULT_DB;
	}
}

async function writeDb(data: DatabaseSchema): Promise<void> {
	await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

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
	const db = await readDb();
	if (!search) return db.events;
	const query = search.toLowerCase().trim();
	return db.events.filter(
		(e) =>
			e.title.toLowerCase().includes(query) ||
			(e.date && e.date.toLowerCase().includes(query)) ||
			(e.location && e.location.toLowerCase().includes(query)) ||
			(e.description && e.description.toLowerCase().includes(query))
	);
}

export async function getEventById(id: number): Promise<EventModel | null> {
	const db = await readDb();
	const event = db.events.find((e) => e.id === id);
	return event ?? null;
}

export async function createEvent(data: CreateEventDTO): Promise<EventModel> {
	const db = await readDb();
	const trimmedTitle = data.title.trim();
	if (!trimmedTitle) {
		throw new Error("Event titel er påkrævet");
	}
	if (!data.date) {
		throw new Error("Dato er påkrævet");
	}

	const maxId = db.events.length > 0 ? Math.max(...db.events.map((e) => e.id)) : -1;
	const newEvent: EventModel = {
		id: maxId + 1,
		title: trimmedTitle,
		date: data.date,
		location: data.location?.trim() || undefined,
		description: data.description?.trim() || undefined,
		status: "CREATED",
		durationMinutes: data.durationMinutes || 120,
		blackoutMinutes: data.blackoutMinutes !== undefined ? data.blackoutMinutes : 30,
		startedAt: null,
		endedAt: null,
		isConfirmedOver: false,
	};

	db.events.push(newEvent);
	await writeDb(db);
	return newEvent;
}

export async function updateEvent(
	id: number,
	data: UpdateEventDTO
): Promise<EventModel> {
	const db = await readDb();
	const index = db.events.findIndex((e) => e.id === id);
	if (index === -1) {
		throw new Error(`Event med id ${id} blev ikke fundet`);
	}

	const current = db.events[index];
	if (data.title !== undefined) {
		const trimmed = data.title.trim();
		if (!trimmed) throw new Error("Event titel må ikke være tom");
		current.title = trimmed;
	}
	if (data.date !== undefined) {
		if (!data.date) throw new Error("Dato må ikke være tom");
		current.date = data.date;
	}
	if (data.location !== undefined) {
		current.location = data.location.trim() || undefined;
	}
	if (data.description !== undefined) {
		current.description = data.description.trim() || undefined;
	}
	if (data.status !== undefined) {
		current.status = data.status;
	}
	if (data.durationMinutes !== undefined) {
		current.durationMinutes = data.durationMinutes;
	}
	if (data.blackoutMinutes !== undefined) {
		current.blackoutMinutes = data.blackoutMinutes;
	}
	if (data.startedAt !== undefined) {
		current.startedAt = data.startedAt;
	}
	if (data.endedAt !== undefined) {
		current.endedAt = data.endedAt;
	}
	if (data.isConfirmedOver !== undefined) {
		current.isConfirmedOver = data.isConfirmedOver;
	}

	db.events[index] = current;
	await writeDb(db);
	return current;
}

export async function deleteEvent(id: number): Promise<boolean> {
	const db = await readDb();
	const index = db.events.findIndex((e) => e.id === id);
	if (index === -1) {
		throw new Error(`Event med id ${id} blev ikke fundet`);
	}

	// Remove event
	db.events.splice(index, 1);

	// Find classes, teams, stations for this event to cascade accounts
	const classIds = db.classes.filter((c) => c.eventId === id).map((c) => c.id);
	const teamIds = db.teams.filter((t) => t.eventId === id).map((t) => t.id);
	const stationIds = db.stations.filter((s) => s.eventId === id).map((s) => s.id);

	db.classes = db.classes.filter((c) => c.eventId !== id);
	db.teams = db.teams.filter((t) => t.eventId !== id);
	db.stations = db.stations.filter((s) => s.eventId !== id);
	db.stationTimes = db.stationTimes.filter((st) => st.eventId !== id);
	db.accounts = db.accounts.filter(
		(a) =>
			!(
				(a.teamId && teamIds.includes(a.teamId)) ||
				(a.stationId && stationIds.includes(a.stationId))
			)
	);

	await writeDb(db);
	return true;
}

// ---------------- ACCOUNTS ----------------
export async function getAccounts(
	search?: string,
	type?: AccountType
): Promise<AccountModel[]> {
	const db = await readDb();
	let results = db.accounts;
	if (type) {
		results = results.filter((a) => a.type === type);
	}
	if (search) {
		const q = search.toLowerCase();
		results = results.filter((a) => a.username.toLowerCase().includes(q));
	}
	return results;
}

export async function getAccountById(id: number): Promise<AccountModel | null> {
	const db = await readDb();
	const account = db.accounts.find((a) => a.id === id);
	return account ?? null;
}

export async function createAccount(data: CreateAccountDTO): Promise<AccountModel> {
	const db = await readDb();
	const trimmedUsername = data.username.trim();
	if (!trimmedUsername) {
		throw new Error("Brugernavn er påkrævet");
	}

	const existing = db.accounts.find(
		(a) => a.username.toLowerCase() === trimmedUsername.toLowerCase()
	);
	if (existing) {
		throw new Error(`En konto med brugernavnet "${trimmedUsername}" findes allerede`);
	}

	const maxId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;
	const newAccount: AccountModel = {
		id: maxId + 1,
		username: trimmedUsername,
		password: data.password || generateRandomPassword(),
		type: data.type,
		teamId: data.teamId,
		stationId: data.stationId,
	};

	db.accounts.push(newAccount);
	await writeDb(db);
	return newAccount;
}

export async function updateAccount(
	id: number,
	data: UpdateAccountDTO
): Promise<AccountModel> {
	const db = await readDb();
	const index = db.accounts.findIndex((a) => a.id === id);
	if (index === -1) {
		throw new Error(`Konto med id ${id} blev ikke fundet`);
	}

	const current = db.accounts[index];
	if (data.username !== undefined) {
		const trimmed = data.username.trim();
		if (!trimmed) throw new Error("Brugernavn må ikke være tomt");
		const existing = db.accounts.find(
			(a) => a.id !== id && a.username.toLowerCase() === trimmed.toLowerCase()
		);
		if (existing) {
			throw new Error(`En konto med brugernavnet "${trimmed}" findes allerede`);
		}
		current.username = trimmed;
	}
	if (data.password !== undefined) {
		const trimmed = data.password.trim();
		if (!trimmed) throw new Error("Adgangskode må ikke være tom");
		current.password = trimmed;
	}
	if (data.type !== undefined) current.type = data.type;
	if (data.teamId !== undefined) current.teamId = data.teamId;
	if (data.stationId !== undefined) current.stationId = data.stationId;

	db.accounts[index] = current;
	await writeDb(db);
	return current;
}

export async function deleteAccount(id: number): Promise<boolean> {
	const db = await readDb();
	const index = db.accounts.findIndex((a) => a.id === id);
	if (index === -1) {
		throw new Error(`Konto med id ${id} blev ikke fundet`);
	}
	db.accounts.splice(index, 1);
	await writeDb(db);
	return true;
}

// ---------------- CLASSES ----------------
export async function getClasses(
	eventId?: number,
	search?: string
): Promise<ClassModel[]> {
	const db = await readDb();
	let results = db.classes;
	if (eventId !== undefined) {
		results = results.filter((c) => c.eventId === eventId);
	}
	if (search) {
		const q = search.toLowerCase();
		results = results.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.school.toLowerCase().includes(q)
		);
	}
	return results;
}

export async function getClassById(id: number): Promise<ClassModel | null> {
	const db = await readDb();
	const item = db.classes.find((c) => c.id === id);
	return item ?? null;
}

export async function createClass(data: CreateClassDTO): Promise<ClassModel> {
	const db = await readDb();
	const trimmedName = data.name.trim();
	const trimmedSchool = data.school.trim();
	if (!trimmedName) throw new Error("Klassenavn er påkrævet");
	if (!trimmedSchool) throw new Error("Skole er påkrævet");

	const maxId = db.classes.length > 0 ? Math.max(...db.classes.map((c) => c.id)) : -1;
	const newClass: ClassModel = {
		id: maxId + 1,
		name: trimmedName,
		school: trimmedSchool,
		eventId: data.eventId,
		teacherName: data.teacherName?.trim() || undefined,
	};

	db.classes.push(newClass);

	// Auto-generate teams if initialTeamsCount / teamCount provided
	const count = data.teamCount || data.initialTeamsCount || 0;
	for (let i = 1; i <= count; i++) {
		const teamName = `Hold ${i}`;
		const maxTeamId = db.teams.length > 0 ? Math.max(...db.teams.map((t) => t.id)) : -1;
		const teamId = maxTeamId + 1;
		const maxAccId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;
		const accId = maxAccId + 1;

		const teamAccount: AccountModel = {
			id: accId,
			username: `${slugify(trimmedName)}_hold_${i}_${teamId}`,
			password: generateRandomPassword(),
			type: "TEAM",
			teamId: teamId,
		};
		db.accounts.push(teamAccount);

		const team: TeamModel = {
			id: teamId,
			eventId: data.eventId,
			classId: newClass.id,
			accountId: accId,
			name: teamName,
			isConfigured: false,
		};
		db.teams.push(team);
	}

	await writeDb(db);
	return newClass;
}

export async function updateClass(
	id: number,
	data: UpdateClassDTO
): Promise<ClassModel> {
	const db = await readDb();
	const index = db.classes.findIndex((c) => c.id === id);
	if (index === -1) {
		throw new Error(`Klasse med id ${id} blev ikke fundet`);
	}

	const current = db.classes[index];
	if (data.name !== undefined) {
		const trimmed = data.name.trim();
		if (!trimmed) throw new Error("Klassenavn må ikke være tomt");
		current.name = trimmed;
	}
	if (data.school !== undefined) {
		const trimmed = data.school.trim();
		if (!trimmed) throw new Error("Skole må ikke være tom");
		current.school = trimmed;
	}
	if (data.teacherName !== undefined) {
		current.teacherName = data.teacherName.trim() || undefined;
	}

	db.classes[index] = current;
	await writeDb(db);
	return current;
}

export async function deleteClass(id: number): Promise<boolean> {
	const db = await readDb();
	const index = db.classes.findIndex((c) => c.id === id);
	if (index === -1) {
		throw new Error(`Klasse med id ${id} blev ikke fundet`);
	}
	db.classes.splice(index, 1);

	// Also delete teams in this class
	const teamIds = db.teams.filter((t) => t.classId === id).map((t) => t.id);
	db.teams = db.teams.filter((t) => t.classId !== id);
	db.stationTimes = db.stationTimes.filter((st) => !teamIds.includes(st.teamId));
	db.accounts = db.accounts.filter(
		(a) => !(a.teamId && teamIds.includes(a.teamId))
	);

	await writeDb(db);
	return true;
}

export async function getUniqueSchools(eventId?: number): Promise<string[]> {
	const db = await readDb();
	const filtered =
		eventId !== undefined ? db.classes.filter((c) => c.eventId === eventId) : db.classes;
	const schools = Array.from(new Set(filtered.map((c) => c.school).filter(Boolean)));
	return schools.sort();
}

// ---------------- TEAMS ----------------
export async function getTeams(
	eventId?: number,
	classId?: number,
	search?: string
): Promise<TeamModel[]> {
	const db = await readDb();
	let results = db.teams;
	if (eventId !== undefined) {
		results = results.filter((t) => t.eventId === eventId);
	}
	if (classId !== undefined) {
		results = results.filter((t) => t.classId === classId);
	}
	if (search) {
		const q = search.toLowerCase();
		results = results.filter((t) => t.name.toLowerCase().includes(q));
	}
	return results;
}

export async function getTeamById(id: number): Promise<TeamModel | null> {
	const db = await readDb();
	const item = db.teams.find((t) => t.id === id);
	return item ?? null;
}

export async function createTeam(data: CreateTeamDTO): Promise<TeamModel> {
	const db = await readDb();
	const trimmedName = data.name.trim();
	if (!trimmedName) throw new Error("Holdnavn er påkrævet");

	const maxTeamId = db.teams.length > 0 ? Math.max(...db.teams.map((t) => t.id)) : -1;
	const teamId = maxTeamId + 1;
	const maxAccId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;
	const accId = maxAccId + 1;

	const baseUsername = data.username?.trim() || `${slugify(trimmedName)}_${teamId}`;
	const teamAccount: AccountModel = {
		id: accId,
		username: baseUsername,
		password: data.password?.trim() || generateRandomPassword(),
		type: "TEAM",
		teamId: teamId,
	};
	db.accounts.push(teamAccount);

	const newTeam: TeamModel = {
		id: teamId,
		name: trimmedName,
		classId: data.classId,
		eventId: data.eventId,
		accountId: accId,
		image: data.image,
		isConfigured: data.isConfigured || false,
	};

	db.teams.push(newTeam);
	await writeDb(db);
	return newTeam;
}

export async function updateTeam(
	id: number,
	data: UpdateTeamDTO
): Promise<TeamModel> {
	const db = await readDb();
	const index = db.teams.findIndex((t) => t.id === id);
	if (index === -1) {
		throw new Error(`Hold med id ${id} blev ikke fundet`);
	}

	const current = db.teams[index];
	if (data.name !== undefined) {
		const trimmed = data.name.trim();
		if (!trimmed) throw new Error("Holdnavn må ikke være tomt");
		current.name = trimmed;
	}
	if (data.classId !== undefined) current.classId = data.classId;
	if (data.image !== undefined) current.image = data.image;
	if (data.isConfigured !== undefined) current.isConfigured = data.isConfigured;

	db.teams[index] = current;
	await writeDb(db);
	return current;
}

export async function deleteTeam(id: number): Promise<boolean> {
	const db = await readDb();
	const index = db.teams.findIndex((t) => t.id === id);
	if (index === -1) {
		throw new Error(`Hold med id ${id} blev ikke fundet`);
	}
	db.teams.splice(index, 1);

	// Delete team's recorded times and accounts
	db.stationTimes = db.stationTimes.filter((st) => st.teamId !== id);
	db.accounts = db.accounts.filter((a) => a.teamId !== id);

	await writeDb(db);
	return true;
}

// ---------------- STATIONS ----------------
export async function getStations(
	eventId?: number,
	search?: string
): Promise<StationModel[]> {
	const db = await readDb();
	let results = db.stations;
	if (eventId !== undefined) {
		results = results.filter((s) => s.eventId === eventId);
	}
	if (search) {
		const q = search.toLowerCase();
		results = results.filter(
			(s) =>
				s.name.toLowerCase().includes(q) ||
				(s.location && s.location.toLowerCase().includes(q)) ||
				(s.description && s.description.toLowerCase().includes(q))
		);
	}
	return results;
}

export async function getStationById(id: number): Promise<StationModel | null> {
	const db = await readDb();
	const item = db.stations.find((s) => s.id === id);
	return item ?? null;
}

export async function createStation(data: CreateStationDTO): Promise<StationModel> {
	const db = await readDb();
	const trimmedName = data.name.trim();
	if (!trimmedName) throw new Error("Stationsnavn er påkrævet");

	const maxStationId = db.stations.length > 0 ? Math.max(...db.stations.map((s) => s.id)) : -1;
	const stationId = maxStationId + 1;
	const maxAccId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;
	const accId = maxAccId + 1;

	const baseUsername = data.username?.trim() || `post_${slugify(trimmedName)}_${stationId}`;
	const stationAccount: AccountModel = {
		id: accId,
		username: baseUsername,
		password: data.password?.trim() || generateRandomPassword(),
		type: "POST_GUARD",
		stationId: stationId,
	};
	db.accounts.push(stationAccount);

	const newStation: StationModel = {
		id: stationId,
		name: trimmedName,
		eventId: data.eventId,
		accountId: accId,
		location: data.location?.trim() || undefined,
		description: data.description?.trim() || undefined,
	};

	db.stations.push(newStation);
	await writeDb(db);
	return newStation;
}

export async function updateStation(
	id: number,
	data: UpdateStationDTO
): Promise<StationModel> {
	const db = await readDb();
	const index = db.stations.findIndex((s) => s.id === id);
	if (index === -1) {
		throw new Error(`Station med id ${id} blev ikke fundet`);
	}

	const current = db.stations[index];
	if (data.name !== undefined) {
		const trimmed = data.name.trim();
		if (!trimmed) throw new Error("Stationsnavn må ikke være tomt");
		current.name = trimmed;
	}
	if (data.location !== undefined) current.location = data.location.trim() || undefined;
	if (data.description !== undefined) {
		current.description = data.description.trim() || undefined;
	}

	db.stations[index] = current;
	await writeDb(db);
	return current;
}

export async function deleteStation(id: number): Promise<boolean> {
	const db = await readDb();
	const index = db.stations.findIndex((s) => s.id === id);
	if (index === -1) {
		throw new Error(`Station med id ${id} blev ikke fundet`);
	}
	db.stations.splice(index, 1);

	// Delete station times and station guard accounts
	db.stationTimes = db.stationTimes.filter((st) => st.stationId !== id);
	db.accounts = db.accounts.filter((a) => a.stationId !== id);

	await writeDb(db);
	return true;
}

// ---------------- STATION TIMES ----------------
export async function getStationTimes(filter?: {
	eventId?: number;
	stationId?: number;
	teamId?: number;
}): Promise<StationTimeModel[]> {
	const db = await readDb();
	let results = db.stationTimes;
	if (filter?.eventId !== undefined) {
		results = results.filter((st) => st.eventId === filter.eventId);
	}
	if (filter?.stationId !== undefined) {
		results = results.filter((st) => st.stationId === filter.stationId);
	}
	if (filter?.teamId !== undefined) {
		results = results.filter((st) => st.teamId === filter.teamId);
	}
	return results;
}

export async function getStationTimeById(
	id: number
): Promise<StationTimeModel | null> {
	const db = await readDb();
	const item = db.stationTimes.find((st) => st.id === id);
	return item ?? null;
}

export async function createStationTime(
	data: CreateStationTimeDTO
): Promise<StationTimeModel> {
	const db = await readDb();
	const maxId =
		db.stationTimes.length > 0
			? Math.max(...db.stationTimes.map((st) => st.id))
			: -1;

	const newRecord: StationTimeModel = {
		id: maxId + 1,
		stationId: data.stationId,
		teamId: data.teamId,
		eventId: data.eventId,
		timeSeconds: data.timeSeconds,
		points: data.points,
		completedAt: data.completedAt || new Date().toISOString(),
	};

	db.stationTimes.push(newRecord);
	await writeDb(db);
	return newRecord;
}

export async function updateStationTime(
	id: number,
	data: UpdateStationTimeDTO
): Promise<StationTimeModel> {
	const db = await readDb();
	const index = db.stationTimes.findIndex((st) => st.id === id);
	if (index === -1) {
		throw new Error(`Tidsregistrering med id ${id} blev ikke fundet`);
	}

	const current = db.stationTimes[index];
	if (data.teamId !== undefined) current.teamId = data.teamId;
	if (data.timeSeconds !== undefined) current.timeSeconds = data.timeSeconds;
	if (data.points !== undefined) current.points = data.points;
	if (data.completedAt !== undefined) current.completedAt = data.completedAt;

	db.stationTimes[index] = current;
	await writeDb(db);
	return current;
}

export async function deleteStationTime(id: number): Promise<boolean> {
	const db = await readDb();
	const index = db.stationTimes.findIndex((st) => st.id === id);
	if (index === -1) {
		throw new Error(`Tidsregistrering med id ${id} blev ikke fundet`);
	}
	db.stationTimes.splice(index, 1);
	await writeDb(db);
	return true;
}
