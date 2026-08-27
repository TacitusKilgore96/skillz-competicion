import { NextRequest, NextResponse } from "next/server";
import { getAccountById, updateAccount, deleteAccount } from "@/libs/db";
import { UpdateAccountDTO } from "@/models/AccountModel";

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

		const account = await getAccountById(numId);
		if (!account) {
			return NextResponse.json(
				{ success: false, error: "Konto ikke fundet" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, data: account });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af konto";
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

		const body: UpdateAccountDTO = await request.json();
		const updated = await updateAccount(numId, body);
		return NextResponse.json({ success: true, data: updated });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved opdatering af konto";
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

		await deleteAccount(numId);
		return NextResponse.json({ success: true, message: "Konto slettet" });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved sletning af konto";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
