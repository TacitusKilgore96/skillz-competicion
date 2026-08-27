export type AccountRole = "ORGANIZER" | "STATION_GUARD" | "TEAM_LEADER" | "SHARED_TEAM";

export interface AccountModel {
	id: number;
	role: AccountRole;
	username: string;
	password: string;
	name?: string;
	email?: string;
	stationId?: number; // Only linked when role === "STATION_GUARD" (linked to a post/station)
	teamId?: number;    // Linked when role === "TEAM_LEADER" or "SHARED_TEAM" (linked to a team, not a post)
	createdAt?: string;
}
