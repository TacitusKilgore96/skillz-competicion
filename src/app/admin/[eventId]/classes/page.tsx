"use client";

import { EventShell } from "@/app/admin/shell";
import ClassManagement from "@/components/admin/ClassManagement";
import { useParams } from "next/navigation";

export default function ClassesPage() {
	const { eventId } = useParams();

	return (
		<EventShell pageTitle="Klasser">
			<ClassManagement eventId={eventId} />
		</EventShell>
	);
}
