export type AccountType = "ORGANIZER" | "POST_GUARD" | "TEAM";

export interface AccountModel {
	id: number;
	type: AccountType;
	username: string;
	password: string;
	teamId?: number; // Linked team ID for TEAM accounts
}

export interface CreateAccountDTO {
	type: AccountType;
	username: string;
	password: string;
	teamId?: number;
}

export interface UpdateAccountDTO {
	type?: AccountType;
	username?: string;
	password?: string;
	teamId?: number;
}
