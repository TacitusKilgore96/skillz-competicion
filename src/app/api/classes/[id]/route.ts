import { NextRequest, NextResponse } from "next/server";
import { getClassById, updateClass, deleteClass } from "@/libs/db";
import { UpdateClassDTO } from "@/models/ClassModel";

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

		const item = await getClassById(numId);
		if (!item) {
			return NextResponse.json(
				{ success: false, error: "Klasse ikke fundet" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, data: item });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af klasse";
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

		const body: UpdateClassDTO = await request.json();
		const updated = await updateClass(numId, body);
		return NextResponse.json({ success: true, data: updated });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved opdatering af klasse";
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

		await deleteClass(numId);
		return NextResponse.json({ success: true, message: "Klasse slettet" });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved sletning af klasse";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
