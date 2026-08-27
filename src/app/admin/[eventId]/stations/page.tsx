"use client";

import { EventShell } from "@/app/admin/shell";
import StationManagement from "@/components/admin/StationManagement";
import { useParams } from "next/navigation";

export default function StationsPage() {
	const { eventId } = useParams();

	return (
		<EventShell pageTitle="Stationer">
			<StationManagement eventId={eventId} />
		</EventShell>
	);
}
