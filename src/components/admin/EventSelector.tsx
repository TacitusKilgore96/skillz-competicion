"use client";

import React from "react";
import { cn } from "tailwind-variants";
import card from "@/components/admin/Card";
import textField from "@/components/admin/TextField";
import Link from "next/link";

interface EventSelectorProps {
	events: EventModel[] | null | undefined;
	selectedEventId: number | null;
	onSelectEvent: (id: number | null) => void;
	loading?: boolean;
}

export function EventSelector({
	events,
	selectedEventId,
	onSelectEvent,
	loading = false,
}: EventSelectorProps) {
	const currentEvent = events?.find((e) => e.id === selectedEventId);

	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const val = e.target.value;
		if (val === "all" || val === "") {
			onSelectEvent(null);
		} else {
			onSelectEvent(Number(val));
		}
	}

	return (
		<div
			className={cn(
				card(),
				"bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
			)}
		>
			<div className={"flex items-center gap-3"}>
				<div className={"w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm"}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<div>
					<p className={"text-xs font-bold uppercase tracking-wider text-blue-900"}>
						Aktiv Begivenhed
					</p>
					<p className={"text-xs text-blue-700/80"}>
						{currentEvent
							? `Filtrerer og redigerer for: ${currentEvent.name}`
							: "Viser data på tværs af alle begivenheder"}
					</p>
				</div>
			</div>

			<div className={"flex items-center gap-3 w-full sm:w-auto"}>
				<select
					className={cn(
						textField(),
						"bg-white border-blue-300 font-semibold text-gray-800 text-sm py-2 px-3 min-w-56 cursor-pointer"
					)}
					value={selectedEventId !== null ? String(selectedEventId) : "all"}
					onChange={handleChange}
					disabled={loading}
				>
					<option value="all">🌐 Alle begivenheder</option>
					{events?.map((event) => (
						<option key={event.id} value={event.id}>
							📅 {event.name} ({event.date}) [{event.status}]
						</option>
					))}
				</select>

				{currentEvent && (
					<Link
						href={`/admin/events/${currentEvent.id}`}
						className={"text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap hidden md:inline"}
						title="Åbn begivenhedens detaljer"
					>
						Se begivenhed →
					</Link>
				)}
			</div>
		</div>
	);
}
