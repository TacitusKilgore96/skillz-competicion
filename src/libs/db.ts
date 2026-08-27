import fs from "fs/promises";
import path from "path";
import { EventModel, CreateEventDTO, UpdateEventDTO } from "@/models/EventModel";
import {
	AccountModel,
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

	// Find classes and their teams
	const eventClasses = db.classes.filter((c) => c.eventId === id);
	const classIds = new Set(eventClasses.map((c) => c.id));
	const eventTeams = db.teams.filter((t) => t.eventId === id || classIds.has(t.classId));
	const teamAccountIds = new Set(eventTeams.map((t) => t.accountId));

	// Find stations for this event
	const eventStations = db.stations.filter((s) => s.eventId === id);
	const stationAccountIds = new Set(eventStations.map((s) => s.accountId));

	// Remove classes, teams, stations, station times
	db.classes = db.classes.filter((c) => c.eventId !== id);
	db.teams = db.teams.filter((t) => t.eventId !== id && !classIds.has(t.classId));
	db.stations = db.stations.filter((s) => s.eventId !== id);
	db.stationTimes = db.stationTimes.filter((st) => st.eventId !== id);

	// Remove linked accounts
	db.accounts = db.accounts.filter(
		(a) => !teamAccountIds.has(a.id) && !stationAccountIds.has(a.id)
	);

	await writeDb(db);
	return true;
}

// ---------------- ACCOUNTS ----------------
export async function getAccounts(): Promise<AccountModel[]> {
	const db = await readDb();
	return db.accounts;
}

export async function getAccountById(id: number): Promise<AccountModel | null> {
	const db = await readDb();
	const item = db.accounts.find((a) => a.id === id);
	return item ?? null;
}

export async function createAccount(
	data: CreateAccountDTO
): Promise<AccountModel> {
	const db = await readDb();

	const trimmedUsername = data.username.trim();
	if (!trimmedUsername) {
		throw new Error("Brugernavn er påkrævet");
	}
	if (!data.password) {
		throw new Error("Adgangskode er påkrævet");
	}

	const exists = db.accounts.some(
		(a) => a.username.toLowerCase() === trimmedUsername.toLowerCase()
	);
	if (exists) {
		throw new Error(
			`Brugernavnet '${trimmedUsername}' er allerede i brug.`
		);
	}

	const maxId =
		db.accounts.length > 0
			? Math.max(...db.accounts.map((a) => a.id))
			: -1;
	const newAccount: AccountModel = {
		id: maxId + 1,
		type: data.type || "POST_GUARD",
		username: trimmedUsername,
		password: data.password,
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
		if (!trimmed) {
			throw new Error("Brugernavn må ikke være tomt");
		}
		const duplicate = db.accounts.some(
			(a) =>
				a.id !== id &&
				a.username.toLowerCase() === trimmed.toLowerCase()
		);
		if (duplicate) {
			throw new Error(`Brugernavnet '${trimmed}' er allerede i brug.`);
		}
		current.username = trimmed;
	}

	if (data.password !== undefined) {
		if (!data.password) {
			throw new Error("Adgangskode må ikke være tom");
		}
		current.password = data.password;
	}

	if (data.type !== undefined) {
		current.type = data.type;
	}

	if (data.teamId !== undefined) {
		current.teamId = data.teamId;
	}

	if (data.stationId !== undefined) {
		current.stationId = data.stationId;
	}

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

	const account = db.accounts[index];

	// Remove account
	db.accounts.splice(index, 1);

	// If account is linked to a team, delete that team and its recorded times
	if (account.teamId !== undefined) {
		const teamId = account.teamId;
		db.teams = db.teams.filter((t) => t.id !== teamId && t.accountId !== id);
		db.stationTimes = db.stationTimes.filter((st) => st.teamId !== teamId);
	}

	// Also check if any team links directly to this accountId
	const linkedTeam = db.teams.find((t) => t.accountId === id);
	if (linkedTeam) {
		const teamId = linkedTeam.id;
		db.teams = db.teams.filter((t) => t.id !== teamId);
		db.stationTimes = db.stationTimes.filter((st) => st.teamId !== teamId);
	}

	// If account is linked to a station, delete that station and its recorded times
	if (account.stationId !== undefined) {
		const stationId = account.stationId;
		db.stations = db.stations.filter((s) => s.id !== stationId && s.accountId !== id);
		db.stationTimes = db.stationTimes.filter((st) => st.stationId !== stationId);
	}

	const linkedStation = db.stations.find((s) => s.accountId === id);
	if (linkedStation) {
		const stationId = linkedStation.id;
		db.stations = db.stations.filter((s) => s.id !== stationId);
		db.stationTimes = db.stationTimes.filter((st) => st.stationId !== stationId);
	}

	await writeDb(db);
	return true;
}

// ---------------- CLASSES ----------------
export async function getClasses(
	eventId?: number,
	search?: string
): Promise<ClassModel[]> {
	const db = await readDb();
	let result = db.classes;

	if (eventId !== undefined && !isNaN(eventId)) {
		result = result.filter((c) => c.eventId === eventId);
	}

	if (search) {
		const query = search.toLowerCase();
		result = result.filter(
			(c) =>
				c.name.toLowerCase().includes(query) ||
				c.school.toLowerCase().includes(query) ||
				(c.teacherName && c.teacherName.toLowerCase().includes(query))
		);
	}

	return result;
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

	if (!trimmedName) {
		throw new Error("Klassenavn er påkrævet");
	}
	if (!trimmedSchool) {
		throw new Error("Skole er påkrævet");
	}

	const maxClassId = db.classes.length > 0 ? Math.max(...db.classes.map((c) => c.id)) : -1;
	const newClass: ClassModel = {
		id: maxClassId + 1,
		eventId: data.eventId,
		name: trimmedName,
		school: trimmedSchool,
		teacherName: data.teacherName?.trim() || undefined,
	};

	db.classes.push(newClass);

	// Auto-generate teams if requested
	const rawCount = data.initialTeamsCount ?? data.teamCount;
	const teamCount = rawCount ? Number(rawCount) : 0;
	if (teamCount > 0) {
		const classSlug = slugify(trimmedName);
		for (let i = 1; i <= teamCount; i++) {
			const maxTeamId = db.teams.length > 0 ? Math.max(...db.teams.map((t) => t.id)) : -1;
			const nextTeamId = maxTeamId + 1;
			const teamName = `Hold ${i}`;

			// Generate unique username
			let baseUsername = `${classSlug}_hold${i}`;
			let usernameCandidate = baseUsername;
			let suffix = 1;
			while (db.accounts.some((a) => a.username.toLowerCase() === usernameCandidate.toLowerCase())) {
				usernameCandidate = `${baseUsername}_${suffix}`;
				suffix++;
			}

			const maxAccountId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;
			const newAccountId = maxAccountId + 1;

			const newAccount: AccountModel = {
				id: newAccountId,
				type: "TEAM",
				username: usernameCandidate,
				password: generateRandomPassword(),
				teamId: nextTeamId,
			};

			const newTeam: TeamModel = {
				id: nextTeamId,
				eventId: data.eventId,
				classId: newClass.id,
				accountId: newAccountId,
				name: teamName,
				isConfigured: false,
			};

			db.accounts.push(newAccount);
			db.teams.push(newTeam);
		}
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

	// Remove class
	db.classes.splice(index, 1);

	// Find teams belonging to this class
	const classTeams = db.teams.filter((t) => t.classId === id);
	const classTeamIds = new Set(classTeams.map((t) => t.id));
	const classAccountIds = new Set(classTeams.map((t) => t.accountId));

	// Remove teams
	db.teams = db.teams.filter((t) => t.classId !== id);

	// Remove team accounts
	db.accounts = db.accounts.filter(
		(a) => !classAccountIds.has(a.id) && (a.teamId === undefined || !classTeamIds.has(a.teamId))
	);

	// Remove any recorded station times for these teams
	db.stationTimes = db.stationTimes.filter((st) => !classTeamIds.has(st.teamId));

	await writeDb(db);
	return true;
}

// ---------------- TEAMS ----------------
export async function getTeams(
	eventId?: number,
	classId?: number,
	search?: string
): Promise<TeamModel[]> {
	const db = await readDb();
	let result = db.teams;

	if (eventId !== undefined && !isNaN(eventId)) {
		result = result.filter((t) => t.eventId === eventId);
	}

	if (classId !== undefined && !isNaN(classId)) {
		result = result.filter((t) => t.classId === classId);
	}

	if (search) {
		const query = search.toLowerCase();
		result = result.filter((t) => t.name.toLowerCase().includes(query));
	}

	return result;
}

export async function getTeamById(id: number): Promise<TeamModel | null> {
	const db = await readDb();
	const item = db.teams.find((t) => t.id === id);
	return item ?? null;
}

export async function createTeam(data: CreateTeamDTO): Promise<TeamModel> {
	const db = await readDb();

	const trimmedName = data.name.trim();
	if (!trimmedName) {
		throw new Error("Holdnavn er påkrævet");
	}

	// Validate class exists
	const parentClass = db.classes.find((c) => c.id === data.classId);
	if (!parentClass) {
		throw new Error(`Klassen med ID ${data.classId} findes ikke`);
	}

	const maxTeamId = db.teams.length > 0 ? Math.max(...db.teams.map((t) => t.id)) : -1;
	const nextTeamId = maxTeamId + 1;

	// Create shared team account
	let finalUsername: string;
	const customUsername = data.username?.trim();
	if (!customUsername) {
		const classSlug = slugify(parentClass.name);
		const teamSlug = slugify(trimmedName);
		let baseUsername = `${classSlug}_${teamSlug}`;
		let candidate = baseUsername;
		let suffix = 1;
		while (db.accounts.some((a) => a.username.toLowerCase() === candidate.toLowerCase())) {
			candidate = `${baseUsername}_${suffix}`;
			suffix++;
		}
		finalUsername = candidate;
	} else {
		if (db.accounts.some((a) => a.username.toLowerCase() === customUsername.toLowerCase())) {
			throw new Error(`Brugernavnet '${customUsername}' er allerede i brug.`);
		}
		finalUsername = customUsername;
	}

	const maxAccountId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;
	const newAccountId = maxAccountId + 1;

	const newAccount: AccountModel = {
		id: newAccountId,
		type: "TEAM",
		username: finalUsername,
		password: data.password || generateRandomPassword(),
		teamId: nextTeamId,
	};

	const newTeam: TeamModel = {
		id: nextTeamId,
		eventId: data.eventId,
		classId: data.classId,
		accountId: newAccountId,
		name: trimmedName,
		isConfigured: data.isConfigured || false,
	};

	db.accounts.push(newAccount);
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

	if (data.classId !== undefined) {
		const parentClass = db.classes.find((c) => c.id === data.classId);
		if (!parentClass) {
			throw new Error(`Klassen med ID ${data.classId} findes ikke`);
		}
		current.classId = data.classId;
	}

	if (data.isConfigured !== undefined) {
		current.isConfigured = data.isConfigured;
	}

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

	const team = db.teams[index];

	// Remove team
	db.teams.splice(index, 1);

	// Remove linked team account (they cannot exist without each other)
	db.accounts = db.accounts.filter(
		(a) => a.id !== team.accountId && a.teamId !== id
	);

	// Remove any recorded station times for this team
	db.stationTimes = db.stationTimes.filter((st) => st.teamId !== id);

	await writeDb(db);
	return true;
}

// ---------------- STATIONS ----------------
export async function getStations(
	eventId?: number,
	search?: string
): Promise<StationModel[]> {
	const db = await readDb();
	let result = db.stations;

	if (eventId !== undefined && !isNaN(eventId)) {
		result = result.filter((s) => s.eventId === eventId);
	}

	if (search) {
		const query = search.toLowerCase();
		result = result.filter(
			(s) =>
				s.name.toLowerCase().includes(query) ||
				(s.description && s.description.toLowerCase().includes(query)) ||
				(s.location && s.location.toLowerCase().includes(query))
		);
	}

	return result;
}

export async function getStationById(id: number): Promise<StationModel | null> {
	const db = await readDb();
	const item = db.stations.find((s) => s.id === id);
	return item ?? null;
}

export async function createStation(data: CreateStationDTO): Promise<StationModel> {
	const db = await readDb();

	const trimmedName = data.name.trim();
	if (!trimmedName) {
		throw new Error("Stationsnavn er påkrævet");
	}

	const maxStationId = db.stations.length > 0 ? Math.max(...db.stations.map((s) => s.id)) : -1;
	const nextStationId = maxStationId + 1;

	// Create linked station guard account
	let finalUsername: string;
	const customUsername = data.username?.trim();
	if (!customUsername) {
		const stationSlug = slugify(trimmedName);
		let baseUsername = `post_${stationSlug}`;
		let candidate = baseUsername;
		let suffix = 1;
		while (db.accounts.some((a) => a.username.toLowerCase() === candidate.toLowerCase())) {
			candidate = `${baseUsername}_${suffix}`;
			suffix++;
		}
		finalUsername = candidate;
	} else {
		if (db.accounts.some((a) => a.username.toLowerCase() === customUsername.toLowerCase())) {
			throw new Error(`Brugernavnet '${customUsername}' er allerede i brug.`);
		}
		finalUsername = customUsername;
	}

	const maxAccountId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;
	const newAccountId = maxAccountId + 1;

	const newAccount: AccountModel = {
		id: newAccountId,
		type: "POST_GUARD",
		username: finalUsername,
		password: data.password || generateRandomPassword(),
		stationId: nextStationId,
	};

	db.accounts.push(newAccount);

	const newStation: StationModel = {
		id: nextStationId,
		eventId: data.eventId,
		accountId: newAccountId,
		name: trimmedName,
		description: data.description?.trim() || undefined,
		location: data.location?.trim() || undefined,
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

	if (data.description !== undefined) {
		current.description = data.description.trim() || undefined;
	}

	if (data.location !== undefined) {
		current.location = data.location.trim() || undefined;
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

	const station = db.stations[index];

	// Remove station
	db.stations.splice(index, 1);

	// Remove linked station guard account (they cannot exist without each other)
	db.accounts = db.accounts.filter(
		(a) => a.id !== station.accountId && a.stationId !== id
	);

	// Remove any recorded times for this station
	db.stationTimes = db.stationTimes.filter((st) => st.stationId !== id);

	await writeDb(db);
	return true;
}

// ---------------- STATION TIMES ----------------
export async function getStationTimes(filters?: {
	stationId?: number;
	teamId?: number;
	eventId?: number;
}): Promise<StationTimeModel[]> {
	const db = await readDb();
	let result = db.stationTimes;

	if (filters?.eventId !== undefined && !isNaN(filters.eventId)) {
		result = result.filter((st) => st.eventId === filters.eventId);
	}

	if (filters?.stationId !== undefined && !isNaN(filters.stationId)) {
		result = result.filter((st) => st.stationId === filters.stationId);
	}

	if (filters?.teamId !== undefined && !isNaN(filters.teamId)) {
		result = result.filter((st) => st.teamId === filters.teamId);
	}

	return result;
}

export async function getStationTimeById(id: number): Promise<StationTimeModel | null> {
	const db = await readDb();
	const item = db.stationTimes.find((st) => st.id === id);
	return item ?? null;
}

export async function createStationTime(
	data: CreateStationTimeDTO
): Promise<StationTimeModel> {
	const db = await readDb();

	const station = db.stations.find((s) => s.id === data.stationId);
	if (!station) {
		throw new Error(`Stationen med ID ${data.stationId} findes ikke`);
	}

	const team = db.teams.find((t) => t.id === data.teamId);
	if (!team) {
		throw new Error(`Holdet med ID ${data.teamId} findes ikke`);
	}

	if (data.timeSeconds === undefined || isNaN(data.timeSeconds) || data.timeSeconds < 0) {
		throw new Error("Ugyldig tidsregistrering i sekunder");
	}

	const maxId = db.stationTimes.length > 0 ? Math.max(...db.stationTimes.map((st) => st.id)) : -1;
	const newTime: StationTimeModel = {
		id: maxId + 1,
		eventId: data.eventId,
		stationId: data.stationId,
		teamId: data.teamId,
		timeSeconds: Number(data.timeSeconds),
		points: data.points !== undefined ? Number(data.points) : undefined,
		completedAt: new Date().toISOString(),
	};

	db.stationTimes.push(newTime);
	await writeDb(db);
	return newTime;
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

	if (data.teamId !== undefined) {
		const team = db.teams.find((t) => t.id === data.teamId);
		if (!team) {
			throw new Error(`Holdet med ID ${data.teamId} findes ikke`);
		}
		current.teamId = data.teamId;
	}

	if (data.timeSeconds !== undefined) {
		if (isNaN(data.timeSeconds) || data.timeSeconds < 0) {
			throw new Error("Ugyldig tidsregistrering i sekunder");
		}
		current.timeSeconds = Number(data.timeSeconds);
	}

	if (data.points !== undefined) {
		current.points = isNaN(Number(data.points)) ? undefined : Number(data.points);
	}

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

// ---------------- SCHOOLS ----------------
export async function getSchools(eventId?: number): Promise<string[]> {
	const db = await readDb();
	let classes = db.classes;
	if (eventId !== undefined && !isNaN(eventId)) {
		classes = classes.filter((c) => c.eventId === eventId);
	}
	const schoolsSet = new Set<string>();
	for (const c of classes) {
		if (c.school && c.school.trim()) {
			schoolsSet.add(c.school.trim());
		}
	}
	return Array.from(schoolsSet).sort();
}

export { getSchools as getUniqueSchools };
