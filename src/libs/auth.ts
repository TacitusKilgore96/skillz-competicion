import { AccountModel, AccountType } from "@/models/AccountModel";

export interface AuthUser {
	id: number;
	username: string;
	type: AccountType;
	teamId?: number;
	stationId?: number;
}

export async function loginUser(
	username: string,
	password: string
): Promise<AuthUser> {
	const res = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password }),
	});
	const json = await res.json();
	if (!res.ok || !json.success) {
		throw new Error(json.error || "Ugyldigt brugernavn eller adgangskode");
	}
	return json.user as AuthUser;
}

export async function logoutUser(): Promise<void> {
	await fetch("/api/auth/logout", {
		method: "POST",
	});
}

export async function getCurrentUser(): Promise<AuthUser | null> {
	try {
		const res = await fetch("/api/auth/me", { cache: "no-store" });
		if (!res.ok) return null;
		const json = await res.json();
		if (!json.success || !json.user) return null;
		return json.user as AuthUser;
	} catch {
		return null;
	}
}
