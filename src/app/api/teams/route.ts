import { NextRequest, NextResponse } from "next/server";
import { getTeams, createTeam } from "@/libs/db";
import { CreateTeamDTO } from "@/models/TeamModel";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const eventIdStr = searchParams.get("eventId");
		const classIdStr = searchParams.get("classId");
		const eventId = eventIdStr !== null ? Number(eventIdStr) : undefined;
		const classId = classIdStr !== null ? Number(classIdStr) : undefined;
		const search = searchParams.get("search") || undefined;

		const teams = await getTeams(eventId, classId, search);
		return NextResponse.json({ success: true, data: teams });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af hold";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body: CreateTeamDTO = await request.json();
		const newTeam = await createTeam(body);
		return NextResponse.json({ success: true, data: newTeam }, { status: 201 });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved oprettelse af hold";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
