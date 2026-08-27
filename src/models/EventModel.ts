export type EventStatus = "CREATED" | "RUNNING" | "FINISHED";

export interface EventModel {
	id: number;
	title: string;
	date: string;
	description?: string;
	location?: string;
	status?: EventStatus;
	durationMinutes?: number;
	blackoutMinutes?: number;
	startedAt?: string | null;
	endedAt?: string | null;
	isConfirmedOver?: boolean;
}

export interface CreateEventDTO {
	title: string;
	date: string;
	description?: string;
	location?: string;
	durationMinutes?: number;
	blackoutMinutes?: number;
}

export interface UpdateEventDTO {
	title?: string;
	date?: string;
	description?: string;
	location?: string;
	status?: EventStatus;
	durationMinutes?: number;
	blackoutMinutes?: number;
	startedAt?: string | null;
	endedAt?: string | null;
	isConfirmedOver?: boolean;
}
