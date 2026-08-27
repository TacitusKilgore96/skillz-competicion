export interface EventModel {
	id: number;
	title: string;
	date: string;
	description?: string;
	location?: string;
}

export interface CreateEventDTO {
	title: string;
	date: string;
	description?: string;
	location?: string;
}

export interface UpdateEventDTO {
	title?: string;
	date?: string;
	description?: string;
	location?: string;
}
