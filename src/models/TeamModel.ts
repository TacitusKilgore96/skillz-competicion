export interface TeamModel {
	id: number;
	eventId: number;
	classId: number;
	accountId: number;
	name: string;
	image?: string;
	isConfigured?: boolean;
}

export interface CreateTeamDTO {
	eventId: number;
	classId: number;
	name: string;
	username?: string;
	password?: string;
}

export interface UpdateTeamDTO {
	classId?: number;
	name?: string;
	image?: string;
	isConfigured?: boolean;
}
