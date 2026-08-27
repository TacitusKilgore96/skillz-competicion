import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAccounts } from "@/libs/db";
import { AuthUser } from "@/libs/auth";

export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json();
		const trimmedUser = (username || "").trim();

		if (!trimmedUser || !password) {
			return NextResponse.json(
				{ success: false, error: "Indtast venligst både brugernavn og adgangskode" },
				{ status: 400 }
			);
		}

		const accounts = await getAccounts();
		const account = accounts.find(
			(a) =>
				a.username.toLowerCase() === trimmedUser.toLowerCase() &&
				a.password === password
		);

		if (!account) {
			return NextResponse.json(
				{ success: false, error: "Forkert brugernavn eller adgangskode" },
				{ status: 401 }
			);
		}

		const authUser: AuthUser = {
			id: account.id,
			username: account.username,
			type: account.type,
			teamId: account.teamId,
			stationId: account.stationId,
		};

		const cookieStore = await cookies();
		cookieStore.set("skills_auth", JSON.stringify(authUser), {
			path: "/",
			httpOnly: false,
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		return NextResponse.json({ success: true, user: authUser });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Der opstod en fejl under login";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}
