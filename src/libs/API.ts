import db from "@/db.local.json";

// In-memory store that starts from the JSON file (simulates a backend)
let eventsStore: EventModel[] = (db.events ?? []) as EventModel[];
let schoolsStore: SchoolModel[] = (db.schools ?? []) as SchoolModel[];
let classesStore: ClassModel[] = (db.classes ?? []) as ClassModel[];
let teamsStore: TeamModel[] = (db.teams ?? []) as TeamModel[];
let stationsStore: StationModel[] = (db.stations ?? []) as StationModel[];

// ── Events API ───────────────────────────────────────────────────────────────

export async function getEvents() {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return [...eventsStore];
}

export async function getEventById(id: number): Promise<EventModel | undefined> {
	await new Promise((resolve) => setTimeout(resolve, 150));
	return eventsStore.find((event) => event.id === id);
}

export async function createEvent(data: Omit<EventModel, "id">): Promise<EventModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	const newId = eventsStore.length > 0 ? Math.max(...eventsStore.map(e => e.id)) + 1 : 0;
	const newEvent: EventModel = { id: newId, ...data };
	eventsStore = [...eventsStore, newEvent];
	return newEvent;
}

export async function updateEvent(id: number, data: Partial<Omit<EventModel, "id">>): Promise<EventModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	eventsStore = eventsStore.map(e => e.id === id ? { ...e, ...data } : e);
	const updated = eventsStore.find(e => e.id === id);
	if (!updated) throw new Error("Event not found");
	return updated;
}

export async function deleteEvent(id: number): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	eventsStore = eventsStore.filter(e => e.id !== id);
}

// ── Schools API ──────────────────────────────────────────────────────────────

export async function getSchools(): Promise<SchoolModel[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return [...schoolsStore];
}

export async function getSchoolById(id: number): Promise<SchoolModel | undefined> {
	return schoolsStore.find((s) => s.id === id);
}

export async function createSchool(data: Omit<SchoolModel, "id">): Promise<SchoolModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	const newId = schoolsStore.length > 0 ? Math.max(...schoolsStore.map(s => s.id)) + 1 : 1;
	const newSchool: SchoolModel = { id: newId, ...data };
	schoolsStore = [...schoolsStore, newSchool];
	return newSchool;
}

export async function updateSchool(id: number, data: Partial<Omit<SchoolModel, "id">>): Promise<SchoolModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	schoolsStore = schoolsStore.map(s => s.id === id ? { ...s, ...data } : s);
	const updated = schoolsStore.find(s => s.id === id);
	if (!updated) throw new Error("School not found");
	return updated;
}

export async function deleteSchool(id: number): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	schoolsStore = schoolsStore.filter(s => s.id !== id);
}

// ── Classes API ──────────────────────────────────────────────────────────────

export async function getClasses(): Promise<ClassModel[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return [...classesStore];
}

export async function getClassById(id: number): Promise<ClassModel | undefined> {
	return classesStore.find((c) => c.id === id);
}

export async function createClass(data: Omit<ClassModel, "id">): Promise<ClassModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	const newId = classesStore.length > 0 ? Math.max(...classesStore.map(c => c.id)) + 1 : 1;
	const newClass: ClassModel = { id: newId, ...data, eventIds: data.eventIds ?? [] };
	classesStore = [...classesStore, newClass];
	return newClass;
}

export async function updateClass(id: number, data: Partial<Omit<ClassModel, "id">>): Promise<ClassModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	classesStore = classesStore.map(c => c.id === id ? { ...c, ...data } : c);
	const updated = classesStore.find(c => c.id === id);
	if (!updated) throw new Error("Class not found");
	return updated;
}

export async function deleteClass(id: number): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	classesStore = classesStore.filter(c => c.id !== id);
}

// ── Teams API ────────────────────────────────────────────────────────────────

export async function getTeams(): Promise<TeamModel[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return [...teamsStore];
}

export async function getTeamById(id: number): Promise<TeamModel | undefined> {
	return teamsStore.find((t) => t.id === id);
}

export async function createTeam(data: Omit<TeamModel, "id">): Promise<TeamModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	const newId = teamsStore.length > 0 ? Math.max(...teamsStore.map(t => t.id)) + 1 : 1;
	const newTeam: TeamModel = { id: newId, ...data };
	teamsStore = [...teamsStore, newTeam];
	return newTeam;
}

export async function updateTeam(id: number, data: Partial<Omit<TeamModel, "id">>): Promise<TeamModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	teamsStore = teamsStore.map(t => t.id === id ? { ...t, ...data } : t);
	const updated = teamsStore.find(t => t.id === id);
	if (!updated) throw new Error("Team not found");
	return updated;
}

export async function deleteTeam(id: number): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	teamsStore = teamsStore.filter(t => t.id !== id);
}

// ── Stations API ─────────────────────────────────────────────────────────────

export async function getStations(): Promise<StationModel[]> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return [...stationsStore];
}

export async function getStationById(id: number): Promise<StationModel | undefined> {
	await new Promise((resolve) => setTimeout(resolve, 150));
	return stationsStore.find((s) => s.id === id);
}

export async function createStation(data: Omit<StationModel, "id">): Promise<StationModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	const newId = stationsStore.length > 0 ? Math.max(...stationsStore.map(s => s.id)) + 1 : 1;
	const newStation: StationModel = { id: newId, ...data, entries: data.entries ?? [] };
	stationsStore = [...stationsStore, newStation];
	return newStation;
}

export async function updateStation(id: number, data: Partial<Omit<StationModel, "id">>): Promise<StationModel> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	stationsStore = stationsStore.map(s => s.id === id ? { ...s, ...data } : s);
	const updated = stationsStore.find(s => s.id === id);
	if (!updated) throw new Error("Station not found");
	return updated;
}

export async function deleteStation(id: number): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 300));
	stationsStore = stationsStore.filter(s => s.id !== id);
}

export async function updateStationEntry(stationId: number, teamId: number, time: string): Promise<StationModel> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	const station = stationsStore.find(s => s.id === stationId);
	if (!station) throw new Error("Station not found");

	const currentEntries = station.entries ?? [];
	const existingIdx = currentEntries.findIndex(e => e.teamId === teamId);
	let newEntries: StationEntryModel[];

	if (existingIdx >= 0) {
		newEntries = currentEntries.map((e, idx) => idx === existingIdx ? { ...e, time } : e);
	} else {
		newEntries = [...currentEntries, { teamId, time }];
	}

	stationsStore = stationsStore.map(s => s.id === stationId ? { ...s, entries: newEntries } : s);
	const updated = stationsStore.find(s => s.id === stationId);
	if (!updated) throw new Error("Station not found");
	return updated;
}