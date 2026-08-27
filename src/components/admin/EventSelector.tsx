"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import { getEvents } from "@/libs/API";
import useAsync from "@/hooks/useAsync";
import SearchableSelect, { SearchableSelectOption } from "@/components/admin/SearchableSelect";
import { IconCalendar } from "@tabler/icons-react";

interface EventSelectorProps {
	className?: string;
}

export default function EventSelector({ className }: EventSelectorProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { eventId } = useParams();

	const { data: events = [], loading } = useAsync(async () => getEvents(), []);

	// Extract the event id from route params or pathname (e.g., /admin/0 or /admin/0/schools)
	const routeId = useMemo(() => {
		if (eventId !== undefined) {
			return Array.isArray(eventId) ? Number(eventId[0]) : Number(eventId);
		}
		const match = pathname?.match(/^\/admin\/([^/]+)/);
		return match ? Number(match[1]) : undefined;
	}, [eventId, pathname]);

	const options: SearchableSelectOption<number>[] = useMemo(() => {
		return (events || []).map((ev) => ({
			value: ev.id,
			label: ev.title,
			subLabel: ev.date || undefined,
			icon: <IconCalendar size={16} />,
		}));
	}, [events]);

	const handleSelect = (newEventId: number) => {
		const adminMatch = pathname?.match(/^\/admin\/([^/]+)(.*)$/);
		const targetPath = adminMatch
			? `/admin/${newEventId}${adminMatch[2] || ""}`
			: `/admin/${newEventId}`;

		if (pathname !== targetPath) {
			router.push(targetPath);
		}
	};

	return (
		<div className={className}>
			<SearchableSelect<number>
				value={routeId !== undefined && !isNaN(routeId) ? routeId : null}
				onChange={handleSelect}
				options={options}
				placeholder={loading ? "Indlæser..." : "Vælg begivenhed..."}
				className="w-64"
				emptyText="Ingen begivenheder fundet"
				noResultsText="Ingen begivenheder matcher søgningen"
			/>
		</div>
	);
}
