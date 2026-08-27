import { AccountModel, AccountType } from "@/models/AccountModel";

export interface AuthUser {
	id: number;
	username: string;
	type: AccountType;
	teamId?: number;
	stationId?: number;
}

let cachedAuthUser: AuthUser | null | undefined = undefined;
let inFlightAuthPromise: Promise<AuthUser | null> | null = null;

export function getCachedUser(): AuthUser | null | undefined {
	return cachedAuthUser;
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
	cachedAuthUser = json.user as AuthUser;
	return cachedAuthUser;
}

export async function logoutUser(): Promise<void> {
	cachedAuthUser = null;
	await fetch("/api/auth/logout", {
		method: "POST",
	});
}

export async function getCurrentUser(forceRefresh = false): Promise<AuthUser | null> {
	if (!forceRefresh && cachedAuthUser !== undefined) {
		return cachedAuthUser;
	}

	if (inFlightAuthPromise) {
		return inFlightAuthPromise;
	}

	inFlightAuthPromise = (async () => {
		try {
			const res = await fetch("/api/auth/me", { cache: "no-store" });
			if (!res.ok) {
				cachedAuthUser = null;
				return null;
			}
			const json = await res.json();
			if (!json.success || !json.user) {
				cachedAuthUser = null;
				return null;
			}
			cachedAuthUser = json.user as AuthUser;
			return cachedAuthUser;
		} catch {
			cachedAuthUser = null;
			return null;
		} finally {
			inFlightAuthPromise = null;
		}
	})();

	return inFlightAuthPromise;
}
