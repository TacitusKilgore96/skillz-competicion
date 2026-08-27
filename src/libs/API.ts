import db from "@/db.local.json";
import { EventModel } from "@/models/EventModel";
import { AccountModel, CreateAccountDTO, UpdateAccountDTO } from "@/models/AccountModel";
import { ClassModel, CreateClassDTO, UpdateClassDTO } from "@/models/ClassModel";
import { TeamModel, CreateTeamDTO, UpdateTeamDTO } from "@/models/TeamModel";
import {
	StationModel,
	CreateStationDTO,
	UpdateStationDTO,
	StationTimeModel,
	CreateStationTimeDTO,
	UpdateStationTimeDTO,
} from "@/models/StationModel";

async function simulateLoading() {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, 300);
	});
}

// ---------------- EVENTS ----------------
export async function getEvents(): Promise<EventModel[]> {
	await simulateLoading();
	return Promise.resolve(db.events as EventModel[]);
}

// ---------------- ACCOUNTS ----------------
export async function getAccounts(params?: {
	search?: string;
	type?: string;
}): Promise<AccountModel[]> {
	const query = new URLSearchParams();
	if (params?.search) query.append("search", params.search);
	if (params?.type && params.type !== "ALL") query.append("type", params.type);

	const url = `/api/accounts${query.toString() ? `?${query.toString()}` : ""}`;
	const res = await fetch(url, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente konti");
	}
	return json.data as AccountModel[];
}

export async function getAccountById(id: number): Promise<AccountModel> {
	const res = await fetch(`/api/accounts/${id}`, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente konto");
	}
	return json.data as AccountModel;
}

export async function createAccount(data: CreateAccountDTO): Promise<AccountModel> {
	const res = await fetch("/api/accounts", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke oprette konto");
	}
	return json.data as AccountModel;
}

export async function updateAccount(
	id: number,
	data: UpdateAccountDTO
): Promise<AccountModel> {
	const res = await fetch(`/api/accounts/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke opdatere konto");
	}
	return json.data as AccountModel;
}

export async function deleteAccount(id: number): Promise<void> {
	const res = await fetch(`/api/accounts/${id}`, {
		method: "DELETE",
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke slette konto");
	}
}

// ---------------- CLASSES ----------------
export async function getClasses(params?: {
	eventId?: number;
	search?: string;
}): Promise<ClassModel[]> {
	const query = new URLSearchParams();
	if (params?.eventId !== undefined) query.append("eventId", String(params.eventId));
	if (params?.search) query.append("search", params.search);

	const url = `/api/classes${query.toString() ? `?${query.toString()}` : ""}`;
	const res = await fetch(url, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente klasser");
	}
	return json.data as ClassModel[];
}

export async function getClassById(id: number): Promise<ClassModel> {
	const res = await fetch(`/api/classes/${id}`, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente klasse");
	}
	return json.data as ClassModel;
}

export async function createClass(data: CreateClassDTO): Promise<ClassModel> {
	const res = await fetch("/api/classes", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke oprette klasse");
	}
	return json.data as ClassModel;
}

export async function updateClass(
	id: number,
	data: UpdateClassDTO
): Promise<ClassModel> {
	const res = await fetch(`/api/classes/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke opdatere klasse");
	}
	return json.data as ClassModel;
}

export async function deleteClass(id: number): Promise<void> {
	const res = await fetch(`/api/classes/${id}`, {
		method: "DELETE",
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke slette klasse");
	}
}

// ---------------- TEAMS ----------------
export async function getTeams(params?: {
	eventId?: number;
	classId?: number;
	search?: string;
}): Promise<TeamModel[]> {
	const query = new URLSearchParams();
	if (params?.eventId !== undefined) query.append("eventId", String(params.eventId));
	if (params?.classId !== undefined) query.append("classId", String(params.classId));
	if (params?.search) query.append("search", params.search);

	const url = `/api/teams${query.toString() ? `?${query.toString()}` : ""}`;
	const res = await fetch(url, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente hold");
	}
	return json.data as TeamModel[];
}

export async function getTeamById(id: number): Promise<TeamModel> {
	const res = await fetch(`/api/teams/${id}`, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente hold");
	}
	return json.data as TeamModel;
}

export async function createTeam(data: CreateTeamDTO): Promise<TeamModel> {
	const res = await fetch("/api/teams", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke oprette hold");
	}
	return json.data as TeamModel;
}

export async function updateTeam(
	id: number,
	data: UpdateTeamDTO
): Promise<TeamModel> {
	const res = await fetch(`/api/teams/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke opdatere hold");
	}
	return json.data as TeamModel;
}

export async function deleteTeam(id: number): Promise<void> {
	const res = await fetch(`/api/teams/${id}`, {
		method: "DELETE",
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke slette hold");
	}
}

// ---------------- STATIONS ----------------
export async function getStations(params?: {
	eventId?: number;
	search?: string;
}): Promise<StationModel[]> {
	const query = new URLSearchParams();
	if (params?.eventId !== undefined) query.append("eventId", String(params.eventId));
	if (params?.search) query.append("search", params.search);

	const url = `/api/stations${query.toString() ? `?${query.toString()}` : ""}`;
	const res = await fetch(url, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente stationer");
	}
	return json.data as StationModel[];
}

export async function getStationById(id: number): Promise<StationModel> {
	const res = await fetch(`/api/stations/${id}`, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente station");
	}
	return json.data as StationModel;
}

export async function createStation(data: CreateStationDTO): Promise<StationModel> {
	const res = await fetch("/api/stations", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke oprette station");
	}
	return json.data as StationModel;
}

export async function updateStation(
	id: number,
	data: UpdateStationDTO
): Promise<StationModel> {
	const res = await fetch(`/api/stations/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke opdatere station");
	}
	return json.data as StationModel;
}

export async function deleteStation(id: number): Promise<void> {
	const res = await fetch(`/api/stations/${id}`, {
		method: "DELETE",
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke slette station");
	}
}

// ---------------- STATION TIMES ----------------
export async function getStationTimes(params?: {
	eventId?: number;
	stationId?: number;
	teamId?: number;
}): Promise<StationTimeModel[]> {
	const query = new URLSearchParams();
	if (params?.eventId !== undefined) query.append("eventId", String(params.eventId));
	if (params?.stationId !== undefined) query.append("stationId", String(params.stationId));
	if (params?.teamId !== undefined) query.append("teamId", String(params.teamId));

	const url = `/api/station-times${query.toString() ? `?${query.toString()}` : ""}`;
	const res = await fetch(url, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente tidsregistreringer");
	}
	return json.data as StationTimeModel[];
}

export async function createStationTime(
	data: CreateStationTimeDTO
): Promise<StationTimeModel> {
	const res = await fetch("/api/station-times", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke registrere tid");
	}
	return json.data as StationTimeModel;
}

export async function updateStationTime(
	id: number,
	data: UpdateStationTimeDTO
): Promise<StationTimeModel> {
	const res = await fetch(`/api/station-times/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke opdatere tidsregistrering");
	}
	return json.data as StationTimeModel;
}

export async function deleteStationTime(id: number): Promise<void> {
	const res = await fetch(`/api/station-times/${id}`, {
		method: "DELETE",
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke slette tidsregistrering");
	}
}

// ---------------- SCHOOLS ----------------
export async function getSchools(eventId?: number): Promise<string[]> {
	const query = new URLSearchParams();
	if (eventId !== undefined) query.append("eventId", String(eventId));

	const url = `/api/schools${query.toString() ? `?${query.toString()}` : ""}`;
	const res = await fetch(url, { cache: "no-store" });
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Kunne ikke hente skoler");
	}
	return json.data as string[];
}
