import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
	try {
		const cookieStore = await cookies();
		cookieStore.delete("skills_auth");
		return NextResponse.json({ success: true, message: "Logget ud" });
	} catch {
		return NextResponse.json({ success: true });
	}
}
