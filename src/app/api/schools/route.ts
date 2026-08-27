import { NextRequest, NextResponse } from "next/server";
import { getUniqueSchools } from "@/libs/db";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const eventIdStr = searchParams.get("eventId");
		const eventId = eventIdStr !== null ? Number(eventIdStr) : undefined;

		const schools = await getUniqueSchools(eventId);
		return NextResponse.json({ success: true, data: schools });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af skoler";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}
