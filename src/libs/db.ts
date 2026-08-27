import fs from "fs/promises";
import path from "path";
import { EventModel } from "@/models/EventModel";
import { AccountModel, CreateAccountDTO, UpdateAccountDTO } from "@/models/AccountModel";
import { ClassModel, CreateClassDTO, UpdateClassDTO } from "@/models/ClassModel";
import { TeamModel, CreateTeamDTO, UpdateTeamDTO } from "@/models/TeamModel";

export interface DatabaseSchema {
	events: EventModel[];
	accounts: AccountModel[];
	classes: ClassModel[];
	teams: TeamModel[];
}

const DEFAULT_DB: DatabaseSchema = {
	events: [
		{
			id: 0,
			title: "Event Title",
			date: "2023-09-20",
		},
		{
			id: 1,
			title: "DM i Skills 2024",
			date: "2024-04-18",
		},
		{
			id: 2,
			title: "Regionsmesterskab 2024",
			date: "2024-05-12",
		},
	],
	accounts: [
		{
			id: 0,
			type: "ORGANIZER",
			username: "organizer",
			password: "password123",
		},
		{
			id: 1,
			type: "POST_GUARD",
			username: "post_guard",
			password: "password123",
		},
	],
	classes: [],
	teams: [],
};

function getDbPath(): string {
	return path.join(process.cwd(), "src", "db.local.json");
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[æ]/g, "ae")
		.replace(/[ø]/g, "oe")
		.replace(/[å]/g, "aa")
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
}

function generateSimplePassword(): string {
	const chars = "abcdefghjkmnpqrstuvwxyz23456789";
	let res = "";
	for (let i = 0; i < 6; i++) {
		res += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return res;
}

export async function readDb(): Promise<DatabaseSchema> {
	const filePath = getDbPath();
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		const data = JSON.parse(raw);
		if (!data.accounts) data.accounts = [];
		if (!data.events) data.events = [];
		if (!data.classes) data.classes = [];
		if (!data.teams) data.teams = [];
		return data as DatabaseSchema;
	} catch (err: unknown) {
		const nodeErr = err as { code?: string };
		if (nodeErr.code === "ENOENT") {
			await writeDb(DEFAULT_DB);
			return DEFAULT_DB;
		}
		throw err;
	}
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
	const filePath = getDbPath();
	await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ---------------- ACCOUNTS ----------------
export async function getAccounts(): Promise<AccountModel[]> {
	const db = await readDb();
	return db.accounts;
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
	if (!data.password) {
		throw new Error("Adgangskode er påkrævet");
	}
	if (data.type !== "ORGANIZER" && data.type !== "POST_GUARD" && data.type !== "TEAM") {
		throw new Error("Ugyldig kontotype");
	}

	const exists = db.accounts.some(
		(a) => a.username.toLowerCase() === trimmedUsername.toLowerCase()
	);
	if (exists) {
		throw new Error(`Brugernavnet '${trimmedUsername}' er allerede i brug`);
	}

	const maxId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;
	const newAccount: AccountModel = {
		id: maxId + 1,
		type: data.type,
		username: trimmedUsername,
		password: data.password,
		teamId: data.teamId,
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

	const currentAccount = db.accounts[index];

	if (data.username !== undefined) {
		const trimmedUsername = data.username.trim();
		if (!trimmedUsername) {
			throw new Error("Brugernavn må ikke være tomt");
		}
		const duplicate = db.accounts.some(
			(a) => a.id !== id && a.username.toLowerCase() === trimmedUsername.toLowerCase()
		);
		if (duplicate) {
			throw new Error(`Brugernavnet '${trimmedUsername}' er allerede i brug`);
		}
		currentAccount.username = trimmedUsername;
	}

	if (data.password !== undefined) {
		if (!data.password) {
			throw new Error("Adgangskode må ikke være tom");
		}
		currentAccount.password = data.password;
	}

	if (data.type !== undefined) {
		if (data.type !== "ORGANIZER" && data.type !== "POST_GUARD" && data.type !== "TEAM") {
			throw new Error("Ugyldig kontotype");
		}
		currentAccount.type = data.type;
	}

	if (data.teamId !== undefined) {
		currentAccount.teamId = data.teamId;
	}

	db.accounts[index] = currentAccount;
	await writeDb(db);
	return currentAccount;
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

	// If account is linked to a team, also delete the team (they cannot exist without each other)
	db.teams = db.teams.filter((t) => t.accountId !== id && t.id !== account.teamId);

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

	// Auto-generate teams and shared accounts if initialTeamsCount specified
	const teamsCount = data.initialTeamsCount ? Number(data.initialTeamsCount) : 0;
	if (teamsCount > 0) {
		let maxTeamId = db.teams.length > 0 ? Math.max(...db.teams.map((t) => t.id)) : -1;
		let maxAccountId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;

		const classSlug = slugify(trimmedName);
		const schoolSlug = slugify(trimmedSchool);

		for (let i = 1; i <= teamsCount; i++) {
			maxTeamId++;
			maxAccountId++;

			// Unique username generation
			let baseUsername = `${classSlug}_hold${i}`;
			if (db.accounts.some((a) => a.username.toLowerCase() === baseUsername.toLowerCase())) {
				baseUsername = `${schoolSlug}_${classSlug}_hold${i}`;
			}
			let uniqueUsername = baseUsername;
			let suffix = 1;
			while (db.accounts.some((a) => a.username.toLowerCase() === uniqueUsername.toLowerCase())) {
				uniqueUsername = `${baseUsername}_${suffix}`;
				suffix++;
			}

			const teamPassword = generateSimplePassword();

			const teamAccount: AccountModel = {
				id: maxAccountId,
				type: "TEAM",
				username: uniqueUsername,
				password: teamPassword,
				teamId: maxTeamId,
			};
			db.accounts.push(teamAccount);

			const newTeam: TeamModel = {
				id: maxTeamId,
				eventId: data.eventId,
				classId: newClass.id,
				accountId: maxAccountId,
				name: `Hold ${i}`,
				isConfigured: false,
			};
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

	// Find teams in this class
	const teamsInClass = db.teams.filter((t) => t.classId === id);
	const teamAccountIds = new Set(teamsInClass.map((t) => t.accountId));

	// Remove class
	db.classes.splice(index, 1);

	// Cascade delete teams and their accounts
	db.teams = db.teams.filter((t) => t.classId !== id);
	db.accounts = db.accounts.filter(
		(a) => !teamAccountIds.has(a.id) && !(a.teamId && teamsInClass.some((t) => t.id === a.teamId))
	);

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

	const password = data.password?.trim() || generateSimplePassword();

	const maxAccountId = db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) : -1;
	const newAccountId = maxAccountId + 1;

	const teamAccount: AccountModel = {
		id: newAccountId,
		type: "TEAM",
		username: finalUsername,
		password: password,
		teamId: nextTeamId,
	};
	db.accounts.push(teamAccount);

	const newTeam: TeamModel = {
		id: nextTeamId,
		eventId: data.eventId,
		classId: data.classId,
		accountId: newAccountId,
		name: trimmedName,
		isConfigured: false,
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

	if (data.classId !== undefined) {
		const classExists = db.classes.some((c) => c.id === data.classId);
		if (!classExists) {
			throw new Error(`Klassen med ID ${data.classId} findes ikke`);
		}
		current.classId = data.classId;
	}

	if (data.image !== undefined) {
		current.image = data.image;
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

	await writeDb(db);
	return true;
}

// ---------------- SCHOOLS ----------------
export async function getUniqueSchools(eventId?: number): Promise<string[]> {
	const db = await readDb();
	let classes = db.classes;
	if (eventId !== undefined && !isNaN(eventId)) {
		classes = classes.filter((c) => c.eventId === eventId);
	}
	const schoolsSet = new Set<string>();
	classes.forEach((c) => {
		if (c.school && c.school.trim()) {
			schoolsSet.add(c.school.trim());
		}
	});
	return Array.from(schoolsSet).sort((a, b) => a.localeCompare(b, "da-DK"));
}
