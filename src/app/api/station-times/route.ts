import { NextRequest, NextResponse } from "next/server";
import { getStationTimes, createStationTime } from "@/libs/db";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const eventIdParam = searchParams.get("eventId");
		const stationIdParam = searchParams.get("stationId");
		const teamIdParam = searchParams.get("teamId");

		const eventId = eventIdParam !== null ? Number(eventIdParam) : undefined;
		const stationId = stationIdParam !== null ? Number(stationIdParam) : undefined;
		const teamId = teamIdParam !== null ? Number(teamIdParam) : undefined;

		const times = await getStationTimes({ eventId, stationId, teamId });
		return NextResponse.json({ success: true, data: times });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Kunne ikke hente tidsregistreringer";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		if (
			body.eventId === undefined ||
			body.stationId === undefined ||
			body.teamId === undefined ||
			body.timeSeconds === undefined
		) {
			return NextResponse.json(
				{ success: false, error: "eventId, stationId, teamId og timeSeconds er påkrævet" },
				{ status: 400 }
			);
		}
		const newTime = await createStationTime(body);
		return NextResponse.json({ success: true, data: newTime }, { status: 201 });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Kunne ikke oprette tidsregistrering";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
