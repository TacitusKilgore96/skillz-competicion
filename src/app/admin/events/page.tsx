"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminIcon } from "@/app/admin/AdminSidebar";

export interface EventItem {
	id: number;
	name: string;
	date: string;
	location: string;
	status: "Scheduled" | "Draft" | "In Progress" | "Completed";
	description: string;
	connectedSchoolsCount: number;
	connectedTeamsCount: number;
}

export const initialEvents: EventItem[] = [
	{
		id: 1,
		name: "Opening ceremony",
		date: "18 Aug 2026",
		location: "Main hall",
		status: "Scheduled",
		description: "Kick-off event, team registrations, welcome address and equipment distribution.",
		connectedSchoolsCount: 4,
		connectedTeamsCount: 7,
	},
	{
		id: 2,
		name: "Competition day 1",
		date: "19 Aug 2026",
		location: "All posts / Arena A",
		status: "Scheduled",
		description: "Technical skills challenge, robotics, programming, and electronics stations.",
		connectedSchoolsCount: 4,
		connectedTeamsCount: 7,
	},
	{
		id: 3,
		name: "Finals & awards",
		date: "21 Aug 2026",
		location: "Sports centre",
		status: "Draft",
		description: "Head-to-head playoffs between top finalists and ceremony presentation.",
		connectedSchoolsCount: 2,
		connectedTeamsCount: 4,
	},
];

export default function EventsPage() {
	const [events, setEvents] = useState<EventItem[]>(initialEvents);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
	const [isAdding, setIsAdding] = useState(false);

	const [formName, setFormName] = useState("");
	const [formDate, setFormDate] = useState("");
	const [formLocation, setFormLocation] = useState("");
	const [formStatus, setFormStatus] = useState<EventItem["status"]>("Scheduled");
	const [formDescription, setFormDescription] = useState("");

	const filteredEvents = events.filter((ev) => {
		const matchesSearch =
			ev.name.toLowerCase().includes(search.toLowerCase()) ||
			ev.location.toLowerCase().includes(search.toLowerCase()) ||
			ev.date.toLowerCase().includes(search.toLowerCase());
		const matchesStatus = statusFilter === "all" || ev.status.toLowerCase() === statusFilter.toLowerCase();
		return matchesSearch && matchesStatus;
	});

	const openAddModal = () => {
		setFormName("");
		setFormDate("20 Aug 2026");
		setFormLocation("");
		setFormStatus("Scheduled");
		setFormDescription("");
		setIsAdding(true);
		setEditingEvent(null);
	};

	const openEditModal = (ev: EventItem) => {
		setEditingEvent(ev);
		setFormName(ev.name);
		setFormDate(ev.date);
		setFormLocation(ev.location);
		setFormStatus(ev.status);
		setFormDescription(ev.description);
		setIsAdding(false);
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formName.trim()) return;

		if (editingEvent) {
			setEvents((prev) =>
				prev.map((item) =>
					item.id === editingEvent.id
						? {
								...item,
								name: formName,
								date: formDate || "TBA",
								location: formLocation || "TBA",
								status: formStatus,
								description: formDescription,
						  }
						: item
				)
			);
		} else {
			const newEvent: EventItem = {
				id: Date.now(),
				name: formName,
				date: formDate || "TBA",
				location: formLocation || "Main hall",
				status: formStatus,
				description: formDescription || "General competition schedule.",
				connectedSchoolsCount: 4,
				connectedTeamsCount: 7,
			};
			setEvents((prev) => [newEvent, ...prev]);
		}

		setIsAdding(false);
		setEditingEvent(null);
	};

	const handleDelete = (id: number) => {
		if (confirm("Are you sure you want to delete this event?")) {
			setEvents((prev) => prev.filter((ev) => ev.id !== id));
		}
	};

	const getStatusBadge = (status: EventItem["status"]) => {
		switch (status) {
			case "Scheduled":
				return "bg-[#19351a] text-[#63b84f] border-[#63b84f]/20";
			case "In Progress":
				return "bg-blue-500/10 text-blue-400 border-blue-500/20";
			case "Completed":
				return "bg-purple-500/10 text-purple-300 border-purple-500/20";
			case "Draft":
			default:
				return "bg-amber-500/10 text-amber-300 border-amber-500/20";
		}
	};

	return (
		<div>
			{/* Page Header */}
			<div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
				<div>
					<p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#63b84f]">Schedule & Timeline</p>
					<h1 className="text-3xl font-bold tracking-tight text-white">Competition Events</h1>
					<p className="mt-1 text-sm text-slate-400">
						Manage events and inspect schools, classes, and teams participating in each round.
					</p>
				</div>
				<div className="flex gap-3">
					<button
						onClick={openAddModal}
						className="inline-flex items-center gap-2 rounded-lg bg-hover px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#325d23] transition-colors"
					>
						<AdminIcon name="plus" className="size-4" />
						Create Event
					</button>
				</div>
			</div>

			{/* Filters and Controls */}
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative flex-1 max-w-md">
					<AdminIcon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
					<input
						type="text"
						placeholder="Search events by title, date, location..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-lg border border-border/60 bg-box-background py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-[#63b84f] focus:outline-none focus:ring-1 focus:ring-[#63b84f]"
					/>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-xs text-slate-400 font-medium">Status:</span>
					<div className="flex rounded-lg border border-border/60 bg-box-background p-1 text-xs font-medium">
						{["all", "Scheduled", "Draft", "In Progress"].map((st) => (
							<button
								key={st}
								onClick={() => setStatusFilter(st)}
								className={`rounded-md px-3 py-1 transition-colors ${
									statusFilter === st ? "bg-hover text-white font-semibold" : "text-slate-400 hover:text-white"
								}`}
							>
								{st === "all" ? "All" : st}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Events Table / Card List */}
			<div className="overflow-hidden rounded-xl border border-border/60 bg-box-background shadow-lg">
				<div className="divide-y divide-border/40">
					{filteredEvents.length === 0 ? (
						<div className="p-12 text-center">
							<AdminIcon name="calendar" className="mx-auto size-12 text-slate-600 mb-3" />
							<p className="text-base font-semibold text-white">No events found</p>
							<p className="mt-1 text-xs text-slate-400">Try adjusting your search or create a new event.</p>
						</div>
					) : (
						filteredEvents.map((ev) => (
							<div key={ev.id} className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-start gap-4">
									<div className="rounded-xl bg-white/5 border border-border/50 p-3 text-center shrink-0 min-w-[70px]">
										<span className="text-[10px] font-bold uppercase tracking-wider text-[#63b84f]">
											{ev.date.split(" ")[1] || "AUG"}
										</span>
										<p className="text-xl font-black text-white">{ev.date.split(" ")[0] || "19"}</p>
									</div>
									<div>
										<div className="flex flex-wrap items-center gap-2">
											<h3 className="text-base font-bold text-white">{ev.name}</h3>
											<span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadge(ev.status)}`}>
												{ev.status}
											</span>
										</div>
										<p className="mt-1 text-xs text-slate-400 line-clamp-1">{ev.description}</p>
										<div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
											<span className="flex items-center gap-1.5 text-slate-400">
												<AdminIcon name="calendar" className="size-3.5" />
												{ev.location}
											</span>
											<span className="flex items-center gap-1.5 text-slate-400">
												<AdminIcon name="school" className="size-3.5" />
												{ev.connectedSchoolsCount} Schools connected
											</span>
											<span className="flex items-center gap-1.5 text-slate-400">
												<AdminIcon name="team" className="size-3.5" />
												{ev.connectedTeamsCount} Teams registered
											</span>
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
									<Link
										href={`/admin/teams?event=${ev.id}`}
										className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
									>
										<AdminIcon name="team" className="size-3.5 text-[#63b84f]" />
										View Teams
									</Link>
									<button
										onClick={() => openEditModal(ev)}
										className="rounded-lg border border-border/60 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
										title="Edit event"
									>
										<AdminIcon name="edit" className="size-4" />
									</button>
									<button
										onClick={() => handleDelete(ev.id)}
										className="rounded-lg border border-border/60 bg-white/5 p-2 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
										title="Delete event"
									>
										<AdminIcon name="trash" className="size-4" />
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Modal Dialog for Add/Edit */}
			{(isAdding || editingEvent) && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
					<div className="w-full max-w-lg rounded-2xl border border-border bg-box-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
						<div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
							<h3 className="text-lg font-bold text-white">
								{editingEvent ? "Edit Event" : "Create New Event"}
							</h3>
							<button
								onClick={() => {
									setIsAdding(false);
									setEditingEvent(null);
								}}
								className="text-slate-400 hover:text-white"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleSave} className="space-y-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
									Event Title
								</label>
								<input
									type="text"
									required
									value={formName}
									onChange={(e) => setFormName(e.target.value)}
									placeholder="e.g. Competition day 2"
									className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
										Date
									</label>
									<input
										type="text"
										value={formDate}
										onChange={(e) => setFormDate(e.target.value)}
										placeholder="e.g. 19 Aug 2026"
										className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
										Status
									</label>
									<select
										value={formStatus}
										onChange={(e) => setFormStatus(e.target.value as EventItem["status"])}
										className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white focus:border-[#63b84f] focus:outline-none"
									>
										<option value="Scheduled">Scheduled</option>
										<option value="Draft">Draft</option>
										<option value="In Progress">In Progress</option>
										<option value="Completed">Completed</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
									Location / Venue
								</label>
								<input
									type="text"
									value={formLocation}
									onChange={(e) => setFormLocation(e.target.value)}
									placeholder="e.g. Arena B / Main Hall"
									className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
									Description
								</label>
								<textarea
									rows={3}
									value={formDescription}
									onChange={(e) => setFormDescription(e.target.value)}
									placeholder="Brief summary of this competition stage..."
									className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none resize-none"
								/>
							</div>

							<div className="mt-6 flex justify-end gap-3 border-t border-border/50 pt-4">
								<button
									type="button"
									onClick={() => {
										setIsAdding(false);
										setEditingEvent(null);
									}}
									className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="rounded-lg bg-hover px-4 py-2 text-sm font-semibold text-white hover:bg-[#325d23]"
								>
									{editingEvent ? "Save Changes" : "Create Event"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
