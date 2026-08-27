export interface ClassModel {
	id: number;
	eventId: number;
	name: string;
	school: string;
	teacherName?: string;
}

export interface CreateClassDTO {
	eventId: number;
	name: string;
	school: string;
	teacherName?: string;
	initialTeamsCount?: number; // Used during creation to auto-generate teams & accounts
}

export interface UpdateClassDTO {
	name?: string;
	school?: string;
	teacherName?: string;
}
