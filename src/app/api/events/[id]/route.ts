import { NextRequest, NextResponse } from "next/server";
import { getEventById, updateEvent, deleteEvent } from "@/libs/db";
import { UpdateEventDTO } from "@/models/EventModel";
import { broadcastUpdate } from "@/libs/eventBus";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const event = await getEventById(Number(id));
		if (!event) {
			return NextResponse.json(
				{ success: false, error: "Begivenhed ikke fundet" },
				{ status: 404 }
			);
		}
		return NextResponse.json({ success: true, data: event });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af begivenhed";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const body: UpdateEventDTO = await request.json();
		const updated = await updateEvent(Number(id), body);
		broadcastUpdate("event", updated);
		return NextResponse.json({ success: true, data: updated });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved opdatering af begivenhed";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		await deleteEvent(Number(id));
		broadcastUpdate("event", { deletedId: Number(id) });
		return NextResponse.json({ success: true, message: "Begivenhed slettet" });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved sletning af begivenhed";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
