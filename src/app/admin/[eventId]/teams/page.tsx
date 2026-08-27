"use client";

import { EventShell } from "@/app/admin/shell";
import TeamManagement from "@/components/admin/TeamManagement";
import { useParams } from "next/navigation";

export default function TeamsPage() {
	const { eventId } = useParams();

	return (
		<EventShell pageTitle="Hold">
			<TeamManagement eventId={eventId} />
		</EventShell>
	);
}
