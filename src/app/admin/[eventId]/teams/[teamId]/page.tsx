"use client";

import { EventShell } from "@/app/admin/shell";
import TeamManagement from "@/components/admin/TeamManagement";
import { useParams } from "next/navigation";

export default function TeamDetailPage() {
	const { eventId, teamId } = useParams();
	const parsedTeamId =
		teamId !== undefined ? Number(Array.isArray(teamId) ? teamId[0] : teamId) : null;

	return (
		<EventShell pageTitle="Hold">
			<TeamManagement
				eventId={eventId}
				initialTeamId={!isNaN(Number(parsedTeamId)) ? parsedTeamId : null}
			/>
		</EventShell>
	);
}
