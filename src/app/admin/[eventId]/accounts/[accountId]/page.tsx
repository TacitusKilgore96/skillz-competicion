"use client";

import { EventShell } from "@/app/admin/shell";
import AccountManagement from "@/components/admin/AccountManagement";
import { useParams } from "next/navigation";

export default function AccountDetailPage() {
	const { eventId, accountId } = useParams();
	const parsedAccountId =
		accountId !== undefined ? Number(Array.isArray(accountId) ? accountId[0] : accountId) : null;

	return (
		<EventShell pageTitle="Kontoer">
			<AccountManagement
				eventId={eventId}
				initialAccountId={!isNaN(Number(parsedAccountId)) ? parsedAccountId : null}
			/>
		</EventShell>
	);
}
