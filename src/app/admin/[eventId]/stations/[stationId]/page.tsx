"use client";

import { EventShell } from "@/app/admin/shell";
import StationManagement from "@/components/admin/StationManagement";
import { useParams } from "next/navigation";

export default function StationDetailPage() {
	const { eventId, stationId } = useParams();
	const parsedStationId =
		stationId !== undefined ? Number(Array.isArray(stationId) ? stationId[0] : stationId) : null;

	return (
		<EventShell pageTitle="Stationer">
			<StationManagement
				eventId={eventId}
				initialStationId={!isNaN(Number(parsedStationId)) ? parsedStationId : null}
			/>
		</EventShell>
	);
}
