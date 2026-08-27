"use client";

import { EventShell } from "@/app/admin/shell";
import AccountManagement from "@/components/admin/AccountManagement";
import { useParams } from "next/navigation";

export default function AccountsPage() {
	const { eventId } = useParams();

	return (
		<EventShell pageTitle="Kontoer">
			<AccountManagement eventId={eventId} />
		</EventShell>
	);
}
