import { NextRequest, NextResponse } from "next/server";
import { getTeamById, updateTeam, deleteTeam } from "@/libs/db";
import { UpdateTeamDTO } from "@/models/TeamModel";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, segmentData: RouteParams) {
	try {
		const { id } = await segmentData.params;
		const numId = Number(id);
		if (isNaN(numId)) {
			return NextResponse.json({ success: false, error: "Ugyldigt ID" }, { status: 400 });
		}

		const item = await getTeamById(numId);
		if (!item) {
			return NextResponse.json(
				{ success: false, error: "Hold ikke fundet" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, data: item });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af hold";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, segmentData: RouteParams) {
	try {
		const { id } = await segmentData.params;
		const numId = Number(id);
		if (isNaN(numId)) {
			return NextResponse.json({ success: false, error: "Ugyldigt ID" }, { status: 400 });
		}

		const body: UpdateTeamDTO = await request.json();
		const updated = await updateTeam(numId, body);
		return NextResponse.json({ success: true, data: updated });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved opdatering af hold";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}

export async function DELETE(request: NextRequest, segmentData: RouteParams) {
	try {
		const { id } = await segmentData.params;
		const numId = Number(id);
		if (isNaN(numId)) {
			return NextResponse.json({ success: false, error: "Ugyldigt ID" }, { status: 400 });
		}

		await deleteTeam(numId);
		return NextResponse.json({ success: true, message: "Hold slettet" });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved sletning af hold";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
