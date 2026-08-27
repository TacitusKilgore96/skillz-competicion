export interface StationModel {
	id: number;
	eventId: number;
	accountId: number; // Linked POST_GUARD account
	name: string;
	description?: string;
	location?: string;
}

export interface CreateStationDTO {
	eventId: number;
	name: string;
	description?: string;
	location?: string;
	username?: string;
	password?: string;
}

export interface UpdateStationDTO {
	name?: string;
	description?: string;
	location?: string;
}

export interface StationTimeModel {
	id: number;
	eventId: number;
	stationId: number;
	teamId: number;
	timeSeconds: number; // Measured duration in seconds
	points?: number; // Optional point score
	completedAt?: string;
}

export interface CreateStationTimeDTO {
	eventId: number;
	stationId: number;
	teamId: number;
	timeSeconds: number;
	points?: number;
	completedAt?: string;
}

export interface UpdateStationTimeDTO {
	teamId?: number;
	timeSeconds?: number;
	points?: number;
	completedAt?: string;
}
