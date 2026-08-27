"use server";

import fs from "node:fs/promises";
import path from "node:path";
import type { AccountModel, AccountRole } from "@/models/AccountModel";
import { generateRandomPassword, generateRandomUsername } from "@/libs/generators";

const DB_PATH = path.join(process.cwd(), "src", "db.local.json");

interface DbSchema {
	events: EventModel[];
	schools: SchoolModel[];
	classes: ClassModel[];
	teams: TeamModel[];
	stations: StationModel[];
	accounts: AccountModel[];
}

async function readDb(): Promise<DbSchema> {
	try {
		const raw = await fs.readFile(DB_PATH, "utf-8");
		const data = JSON.parse(raw);
		return {
			events: data.events ?? [],
			schools: data.schools ?? [],
			classes: data.classes ?? [],
			teams: data.teams ?? [],
			stations: data.stations ?? [],
			accounts: data.accounts ?? [],
		};
	} catch (error) {
		console.error("Error reading db.local.json:", error);
		return {
			events: [],
			schools: [],
			classes: [],
			teams: [],
			stations: [],
			accounts: [],
		};
	}
}

async function writeDb(db: DbSchema): Promise<void> {
	const json = JSON.stringify(db, null, 2) + "\n";
	await fs.writeFile(DB_PATH, json, "utf-8");
}

// ── Events API ───────────────────────────────────────────────────────────────

export async function getEvents(): Promise<EventModel[]> {
	const db = await readDb();
	return db.events;
}

export async function getEventById(id: number): Promise<EventModel | undefined> {
	const db = await readDb();
	return db.events.find((event) => event.id === id);
}

export async function createEvent(data: Omit<EventModel, "id">): Promise<EventModel> {
	const db = await readDb();
	const newId = db.events.length > 0 ? Math.max(...db.events.map(e => e.id)) + 1 : 0;
	const newEvent: EventModel = { id: newId, ...data };
	db.events = [...db.events, newEvent];
	await writeDb(db);
	return newEvent;
}

export async function updateEvent(id: number, data: Partial<Omit<EventModel, "id">>): Promise<EventModel> {
	const db = await readDb();
	const exists = db.events.some(e => e.id === id);
	if (!exists) throw new Error("Event not found");
	db.events = db.events.map(e => e.id === id ? { ...e, ...data } : e);
	await writeDb(db);
	const updated = db.events.find(e => e.id === id)!;
	return updated;
}

export async function deleteEvent(id: number): Promise<void> {
	const db = await readDb();
	db.events = db.events.filter(e => e.id !== id);
	await writeDb(db);
}

// ── Schools API ──────────────────────────────────────────────────────────────

export async function getSchools(): Promise<SchoolModel[]> {
	const db = await readDb();
	return db.schools;
}

export async function getSchoolById(id: number): Promise<SchoolModel | undefined> {
	const db = await readDb();
	return db.schools.find((s) => s.id === id);
}

export async function createSchool(data: Omit<SchoolModel, "id">): Promise<SchoolModel> {
	const db = await readDb();
	const newId = db.schools.length > 0 ? Math.max(...db.schools.map(s => s.id)) + 1 : 1;
	const newSchool: SchoolModel = { id: newId, ...data };
	db.schools = [...db.schools, newSchool];
	await writeDb(db);
	return newSchool;
}

export async function updateSchool(id: number, data: Partial<Omit<SchoolModel, "id">>): Promise<SchoolModel> {
	const db = await readDb();
	const exists = db.schools.some(s => s.id === id);
	if (!exists) throw new Error("School not found");
	db.schools = db.schools.map(s => s.id === id ? { ...s, ...data } : s);
	await writeDb(db);
	const updated = db.schools.find(s => s.id === id)!;
	return updated;
}

export async function deleteSchool(id: number): Promise<void> {
	const db = await readDb();
	db.schools = db.schools.filter(s => s.id !== id);
	await writeDb(db);
}

// ── Classes API ──────────────────────────────────────────────────────────────

export async function getClasses(): Promise<ClassModel[]> {
	const db = await readDb();
	return db.classes;
}

export async function getClassById(id: number): Promise<ClassModel | undefined> {
	const db = await readDb();
	return db.classes.find((c) => c.id === id);
}

export async function createClass(data: Omit<ClassModel, "id">): Promise<ClassModel> {
	const db = await readDb();
	const newId = db.classes.length > 0 ? Math.max(...db.classes.map(c => c.id)) + 1 : 1;
	const newClass: ClassModel = { id: newId, ...data, eventIds: data.eventIds ?? [] };
	db.classes = [...db.classes, newClass];
	await writeDb(db);
	return newClass;
}

export async function updateClass(id: number, data: Partial<Omit<ClassModel, "id">>): Promise<ClassModel> {
	const db = await readDb();
	const exists = db.classes.some(c => c.id === id);
	if (!exists) throw new Error("Class not found");
	db.classes = db.classes.map(c => c.id === id ? { ...c, ...data } : c);
	await writeDb(db);
	const updated = db.classes.find(c => c.id === id)!;
	return updated;
}

export async function deleteClass(id: number): Promise<void> {
	const db = await readDb();
	db.classes = db.classes.filter(c => c.id !== id);
	await writeDb(db);
}

// ── Teams API ────────────────────────────────────────────────────────────────

export async function getTeams(): Promise<TeamModel[]> {
	const db = await readDb();
	return db.teams;
}

export async function getTeamById(id: number): Promise<TeamModel | undefined> {
	const db = await readDb();
	return db.teams.find((t) => t.id === id);
}

export async function createTeam(data: Omit<TeamModel, "id">): Promise<TeamModel> {
	const db = await readDb();
	const newId = db.teams.length > 0 ? Math.max(...db.teams.map(t => t.id)) + 1 : 1;
	const newTeam: TeamModel = { id: newId, ...data };
	db.teams = [...db.teams, newTeam];

	// Automatically create Team Leader account
	const nextAccId1 = db.accounts.length > 0 ? Math.max(...db.accounts.map(a => a.id)) + 1 : 1;
	const teamLeaderAcc: AccountModel = {
		id: nextAccId1,
		role: "TEAM_LEADER",
		teamId: newId,
		username: generateRandomUsername("leder", newTeam.name),
		password: `tl-${generateRandomPassword(6)}`,
		name: `Holdleder - ${newTeam.name}`,
		createdAt: new Date().toISOString().split("T")[0],
	};

	// Automatically create Shared Team account
	const nextAccId2 = nextAccId1 + 1;
	const sharedTeamAcc: AccountModel = {
		id: nextAccId2,
		role: "SHARED_TEAM",
		teamId: newId,
		username: generateRandomUsername("hold", newTeam.name),
		password: generateRandomPassword(4, true),
		name: `Holdkonto - ${newTeam.name}`,
		createdAt: new Date().toISOString().split("T")[0],
	};

	db.accounts = [...db.accounts, teamLeaderAcc, sharedTeamAcc];
	await writeDb(db);
	return newTeam;
}

export async function updateTeam(id: number, data: Partial<Omit<TeamModel, "id">>): Promise<TeamModel> {
	const db = await readDb();
	const exists = db.teams.some(t => t.id === id);
	if (!exists) throw new Error("Team not found");
	db.teams = db.teams.map(t => t.id === id ? { ...t, ...data } : t);
	await writeDb(db);
	const updated = db.teams.find(t => t.id === id)!;
	return updated;
}

export async function deleteTeam(id: number): Promise<void> {
	const db = await readDb();
	db.teams = db.teams.filter(t => t.id !== id);
	db.accounts = db.accounts.filter(a => a.teamId !== id);
	await writeDb(db);
}

// ── Stations API ─────────────────────────────────────────────────────────────

export async function getStations(): Promise<StationModel[]> {
	const db = await readDb();
	return db.stations;
}

export async function getStationById(id: number): Promise<StationModel | undefined> {
	const db = await readDb();
	return db.stations.find((s) => s.id === id);
}

export async function createStation(data: Omit<StationModel, "id">): Promise<StationModel> {
	const db = await readDb();
	const newId = db.stations.length > 0 ? Math.max(...db.stations.map(s => s.id)) + 1 : 1;
	const newStation: StationModel = { id: newId, ...data, entries: data.entries ?? [] };
	db.stations = [...db.stations, newStation];

	// Automatically create Station Guard account
	const nextAccId = db.accounts.length > 0 ? Math.max(...db.accounts.map(a => a.id)) + 1 : 1;
	const stationGuardAcc: AccountModel = {
		id: nextAccId,
		role: "STATION_GUARD",
		stationId: newId,
		username: generateRandomUsername("vagt", newStation.name),
		password: `vagt-${generateRandomPassword(6)}`,
		name: `Vagt - ${newStation.name}`,
		createdAt: new Date().toISOString().split("T")[0],
	};
	db.accounts = [...db.accounts, stationGuardAcc];
	await writeDb(db);
	return newStation;
}

export async function updateStation(id: number, data: Partial<Omit<StationModel, "id">>): Promise<StationModel> {
	const db = await readDb();
	const exists = db.stations.some(s => s.id === id);
	if (!exists) throw new Error("Station not found");
	db.stations = db.stations.map(s => s.id === id ? { ...s, ...data } : s);
	await writeDb(db);
	const updated = db.stations.find(s => s.id === id)!;
	return updated;
}

export async function deleteStation(id: number): Promise<void> {
	const db = await readDb();
	db.stations = db.stations.filter(s => s.id !== id);
	db.accounts = db.accounts.filter(a => a.stationId !== id);
	await writeDb(db);
}

export async function updateStationEntry(stationId: number, teamId: number, time: string): Promise<StationModel> {
	const db = await readDb();
	const station = db.stations.find(s => s.id === stationId);
	if (!station) throw new Error("Station not found");

	const currentEntries = station.entries ?? [];
	const existingIdx = currentEntries.findIndex(e => e.teamId === teamId);
	let newEntries: StationEntryModel[];

	if (existingIdx >= 0) {
		newEntries = currentEntries.map((e, idx) => idx === existingIdx ? { ...e, time } : e);
	} else {
		newEntries = [...currentEntries, { teamId, time }];
	}

	db.stations = db.stations.map(s => s.id === stationId ? { ...s, entries: newEntries } : s);
	await writeDb(db);
	const updated = db.stations.find(s => s.id === stationId)!;
	return updated;
}

// ── Accounts API ─────────────────────────────────────────────────────────────

export async function getAccounts(): Promise<AccountModel[]> {
	const db = await readDb();
	return db.accounts;
}

export async function getAccountById(id: number): Promise<AccountModel | undefined> {
	const db = await readDb();
	return db.accounts.find((a) => a.id === id);
}

export async function getAccountsByRole(role: AccountRole): Promise<AccountModel[]> {
	const db = await readDb();
	return db.accounts.filter((a) => a.role === role);
}

export async function getAccountsByStationId(stationId: number): Promise<AccountModel[]> {
	const db = await readDb();
	return db.accounts.filter((a) => a.stationId === stationId);
}

export async function getAccountsByTeamId(teamId: number): Promise<AccountModel[]> {
	const db = await readDb();
	return db.accounts.filter((a) => a.teamId === teamId);
}

export async function createAccount(data: Omit<AccountModel, "id">): Promise<AccountModel> {
	const db = await readDb();
	const newId = db.accounts.length > 0 ? Math.max(...db.accounts.map(a => a.id)) + 1 : 1;
	const newAccount: AccountModel = {
		id: newId,
		...data,
		createdAt: data.createdAt ?? new Date().toISOString().split("T")[0],
	};
	db.accounts = [...db.accounts, newAccount];
	await writeDb(db);
	return newAccount;
}

export async function updateAccount(id: number, data: Partial<Omit<AccountModel, "id">>): Promise<AccountModel> {
	const db = await readDb();
	const exists = db.accounts.some(a => a.id === id);
	if (!exists) throw new Error("Account not found");
	db.accounts = db.accounts.map(a => a.id === id ? { ...a, ...data } : a);
	await writeDb(db);
	const updated = db.accounts.find(a => a.id === id)!;
	return updated;
}

export async function deleteAccount(id: number): Promise<void> {
	const db = await readDb();
	db.accounts = db.accounts.filter(a => a.id !== id);
	await writeDb(db);
}

export async function resetAccountPassword(id: number): Promise<{ account: AccountModel; newPassword: string }> {
	const db = await readDb();
	const account = db.accounts.find(a => a.id === id);
	if (!account) throw new Error("Account not found");

	let newPassword = "";
	if (account.role === "SHARED_TEAM") {
		newPassword = generateRandomPassword(4, true);
	} else if (account.role === "STATION_GUARD") {
		newPassword = `vagt-${generateRandomPassword(6)}`;
	} else if (account.role === "TEAM_LEADER") {
		newPassword = `tl-${generateRandomPassword(6)}`;
	} else {
		newPassword = generateRandomPassword(10);
	}

	db.accounts = db.accounts.map(a => a.id === id ? { ...a, password: newPassword } : a);
	await writeDb(db);
	const updated = db.accounts.find(a => a.id === id)!;
	return { account: updated, newPassword };
}