export type AccountType = "ORGANIZER" | "POST_GUARD" | "TEAM";

export interface AccountModel {
	id: number;
	type: AccountType;
	username: string;
	password: string;
	teamId?: number; // Linked team ID for TEAM accounts
	stationId?: number; // Linked station ID for POST_GUARD accounts
}

export interface CreateAccountDTO {
	type: AccountType;
	username: string;
	password: string;
	teamId?: number;
	stationId?: number;
}

export interface UpdateAccountDTO {
	type?: AccountType;
	username?: string;
	password?: string;
	teamId?: number;
	stationId?: number;
}
