import { NextRequest, NextResponse } from "next/server";
import { getEvents, createEvent } from "@/libs/db";
import { CreateEventDTO } from "@/models/EventModel";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || undefined;
		const events = await getEvents(search);
		return NextResponse.json({ success: true, data: events });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af begivenheder";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body: CreateEventDTO = await request.json();
		const newEvent = await createEvent(body);
		return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved oprettelse af begivenhed";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
