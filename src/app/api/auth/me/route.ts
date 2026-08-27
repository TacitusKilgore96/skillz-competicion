import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthUser } from "@/libs/auth";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const authCookie = cookieStore.get("skills_auth");

		if (!authCookie || !authCookie.value) {
			return NextResponse.json({ success: true, user: null });
		}

		const user = JSON.parse(authCookie.value) as AuthUser;
		return NextResponse.json({ success: true, user });
	} catch {
		return NextResponse.json({ success: true, user: null });
	}
}
