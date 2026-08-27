"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconCheck, IconChevronDown, IconLoader2 } from "@tabler/icons-react";
import { cn } from "tailwind-variants";
import { usePathname, useRouter, useParams } from "next/navigation";
import textField from "@/components/admin/TextField";
import { getEvents } from "@/libs/API";
import useAsync from "@/hooks/useAsync";
import { EventModel } from "@/models/EventModel";

interface EventSelectorProps {
	className?: string;
}

export default function EventSelector({ className }: EventSelectorProps) {
	const router = useRouter();
	const pathname = usePathname();
	const {eventId} = useParams();

	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const { data: events = [], loading, error } = useAsync(async () => getEvents(), []);

	// Extract the event id from route params or pathname (e.g., /admin/0 or /admin/0/schools)
	const routeId = useMemo(() => {
		if (eventId !== undefined) {
			return Array.isArray(eventId) ? eventId[0] : String(eventId);
		}
		const match = pathname?.match(/^\/admin\/([^\/]+)/);
		return match ? match[1] : undefined;
	}, [eventId, pathname]);

	// Find the selected event based on the route id
	const selectedEvent = useMemo(() => {
		if (!events || events.length === 0 || routeId === undefined) return undefined;
		return events.find((opt) => String(opt.id) === String(routeId));
	}, [events, routeId]);

	const inputValue = searchQuery !== null ? searchQuery : (selectedEvent ? selectedEvent.title : "");

	const filteredOptions = useMemo(() => {
		if (!events) return [];
		if (!searchQuery) return events;
		const lower = searchQuery.toLowerCase();
		return events.filter((opt) =>
			opt.title.toLowerCase().includes(lower) || (opt.date && opt.date.toLowerCase().includes(lower))
		);
	}, [events, searchQuery]);

	// Handle outside click
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setSearchQuery(null);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function handleSelect(option: EventModel) {
		setSearchQuery(null);
		setIsOpen(false);

		// Redirect to the new event route preserving subpaths if on /admin/:id/...
		const adminMatch = pathname?.match(/^\/admin\/([^\/]+)(.*)$/);
		const targetPath = adminMatch
			? `/admin/${option.id}${adminMatch[2] || ""}`
			: `/admin/${option.id}`;

		if (pathname !== targetPath) {
			router.push(targetPath);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Escape") {
			setIsOpen(false);
			setSearchQuery(null);
		} else if (e.key === "Enter") {
			if (isOpen && filteredOptions.length > 0) {
				e.preventDefault();
				handleSelect(filteredOptions[0]);
			}
		} else if (e.key === "ArrowDown") {
			if (!isOpen) {
				setIsOpen(true);
			}
		}
	}

	return (
		<div ref={containerRef} className={cn("relative w-64", className)}>
			<div className="relative">
				<input
					type="text"
					value={inputValue}
					placeholder={loading ? "Indlæser..." : "Vælg begivenhed..."}
					onChange={(e) => {
						setSearchQuery(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					onKeyDown={handleKeyDown}
					className={cn(textField(), "w-full pr-8 text-sm truncate")}
				/>
				<button
					type="button"
					onClick={() => {
						if (isOpen) {
							setIsOpen(false);
							setSearchQuery(null);
						} else {
							setIsOpen(true);
						}
					}}
					className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
					aria-label="Vælg begivenhed"
				>
					{loading ? (
						<IconLoader2 size={18} className="animate-spin text-slate-400" />
					) : (
						<IconChevronDown size={18} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
					)}
				</button>
			</div>

			{isOpen && (
				<ul className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
					{loading ? (
						<li className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
							<IconLoader2 size={16} className="animate-spin" />
							<span>Indlæser begivenheder...</span>
						</li>
					) : error ? (
						<li className="px-3 py-2 text-sm text-red-500">Fejl ved indlæsning af begivenheder</li>
					) : filteredOptions.length > 0 ? (
						filteredOptions.map((option) => {
							const isSelected = selectedEvent?.id === option.id;
							return (
								<li
									key={option.id}
									onClick={() => handleSelect(option)}
									className={cn(
										"flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-slate-100",
										isSelected && "bg-slate-50 font-semibold text-slate-900"
									)}
								>
									<div className="flex flex-col min-w-0 pr-2">
										<span className="truncate">{option.title}</span>
										{option.date && (
											<span className="text-xs text-slate-400 font-normal">{option.date}</span>
										)}
									</div>
									{isSelected && <IconCheck size={16} className="text-blue-600 shrink-0" />}
								</li>
							);
						})
					) : (
						<li className="px-3 py-2 text-sm text-slate-400">Ingen resultater fundet</li>
					)}
				</ul>
			)}
		</div>
	);
}