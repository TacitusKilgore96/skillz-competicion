import { NextRequest, NextResponse } from "next/server";
import { getClasses, createClass } from "@/libs/db";
import { CreateClassDTO } from "@/models/ClassModel";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const eventIdStr = searchParams.get("eventId");
		const eventId = eventIdStr !== null ? Number(eventIdStr) : undefined;
		const search = searchParams.get("search") || undefined;

		const classes = await getClasses(eventId, search);
		return NextResponse.json({ success: true, data: classes });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af klasser";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body: CreateClassDTO = await request.json();
		const newClass = await createClass(body);
		return NextResponse.json({ success: true, data: newClass }, { status: 201 });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved oprettelse af klasse";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
