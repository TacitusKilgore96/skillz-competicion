import { NextRequest, NextResponse } from "next/server";
import { getStations, createStation } from "@/libs/db";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const eventIdParam = searchParams.get("eventId");
		const eventId = eventIdParam !== null ? Number(eventIdParam) : undefined;
		const search = searchParams.get("search") || undefined;

		const stations = await getStations(eventId, search);
		return NextResponse.json({ success: true, data: stations });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Kunne ikke hente stationer";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		if (!body.name || body.eventId === undefined) {
			return NextResponse.json(
				{ success: false, error: "Stationsnavn og eventId er påkrævet" },
				{ status: 400 }
			);
		}
		const newStation = await createStation(body);
		return NextResponse.json({ success: true, data: newStation }, { status: 201 });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Kunne ikke oprette station";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
