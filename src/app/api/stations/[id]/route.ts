import { NextRequest, NextResponse } from "next/server";
import { getStationById, updateStation, deleteStation } from "@/libs/db";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const numId = Number(id);
		if (isNaN(numId)) {
			return NextResponse.json({ success: false, error: "Ugyldigt station ID" }, { status: 400 });
		}
		const station = await getStationById(numId);
		if (!station) {
			return NextResponse.json({ success: false, error: "Stationen blev ikke fundet" }, { status: 404 });
		}
		return NextResponse.json({ success: true, data: station });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af station";
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
			return NextResponse.json({ success: false, error: "Ugyldigt station ID" }, { status: 400 });
		}
		const body = await request.json();
		const updated = await updateStation(numId, body);
		return NextResponse.json({ success: true, data: updated });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Kunne ikke opdatere station";
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
			return NextResponse.json({ success: false, error: "Ugyldigt station ID" }, { status: 400 });
		}
		await deleteStation(numId);
		return NextResponse.json({ success: true });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Kunne ikke slette station";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
