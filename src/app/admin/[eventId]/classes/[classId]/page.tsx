"use client";

import { EventShell } from "@/app/admin/shell";
import ClassManagement from "@/components/admin/ClassManagement";
import { useParams } from "next/navigation";

export default function ClassDetailPage() {
	const { eventId, classId } = useParams();
	const parsedClassId =
		classId !== undefined ? Number(Array.isArray(classId) ? classId[0] : classId) : null;

	return (
		<EventShell pageTitle="Klasser">
			<ClassManagement
				eventId={eventId}
				initialClassId={!isNaN(Number(parsedClassId)) ? parsedClassId : null}
			/>
		</EventShell>
	);
}
