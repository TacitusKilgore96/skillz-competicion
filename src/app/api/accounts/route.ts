import { NextRequest, NextResponse } from "next/server";
import { getAccounts, createAccount } from "@/libs/db";
import { CreateAccountDTO } from "@/models/AccountModel";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search")?.toLowerCase();
		const type = searchParams.get("type");

		let accounts = await getAccounts();

		if (type && type !== "ALL") {
			accounts = accounts.filter((a) => a.type === type);
		}

		if (search) {
			accounts = accounts.filter(
				(a) =>
					a.username.toLowerCase().includes(search) ||
					(a.type && a.type.toLowerCase().includes(search))
			);
		}

		return NextResponse.json({ success: true, data: accounts });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved hentning af konti";
		return NextResponse.json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body: CreateAccountDTO = await request.json();
		const newAccount = await createAccount(body);
		return NextResponse.json({ success: true, data: newAccount }, { status: 201 });
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : "Fejl ved oprettelse af konto";
		return NextResponse.json({ success: false, error: msg }, { status: 400 });
	}
}
