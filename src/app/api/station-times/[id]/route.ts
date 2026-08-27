import { NextRequest, NextResponse } from "next/server";
import { getStationTimeById, updateStationTime, deleteStationTime } from "@/libs/db";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const numId = Number(id);
		if (isNaN(numId)) {
			return NextResponse.json({ success: false, error: "Ugyldigt ID" }, { status: 400 });
		}
		const item = await getStationTimeById(numId);
		if (!item) {
			return NextResponse.json({ success: false, error: "Tidsregistrering ikke fundet" }, { status: 404 });
		}
		return NextResponse.json({ success: true, data: item });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af registrering";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const numId = Number(id);
		if (isNaN(numId)) {
			return NextResponse.json({ success: false, error: "Ugyldigt ID" }, { status: 400 });
		}
		const body = await request.json();
		const updated = await updateStationTime(numId, body);
		return NextResponse.json({ success: true, data: updated });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Kunne ikke opdatere tidsregistrering";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const numId = Number(id);
		if (isNaN(numId)) {
			return NextResponse.json({ success: false, error: "Ugyldigt ID" }, { status: 400 });
		}
		await deleteStationTime(numId);
		return NextResponse.json({ success: true });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Kunne ikke slette tidsregistrering";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
