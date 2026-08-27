"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "tailwind-variants";
import {
	IconCalendar,
	IconPlus,
	IconTrash,
	IconEdit,
	IconSearch,
	IconX,
	IconLoader2,
	IconAlertTriangle,
	IconCheck,
	IconSchool,
	IconUsers,
	IconFlag,
	IconMapPin,
	IconArrowRight,
	IconTrophy,
} from "@tabler/icons-react";
import { button, iconButton } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import { EventModel, CreateEventDTO, UpdateEventDTO } from "@/models/EventModel";
import { ClassModel } from "@/models/ClassModel";
import { TeamModel } from "@/models/TeamModel";
import { StationModel } from "@/models/StationModel";
import {
	getEvents,
	createEvent,
	updateEvent,
	deleteEvent,
	getClasses,
	getTeams,
	getStations,
} from "@/libs/API";

export default function EventsAdminPage() {
	const router = useRouter();
	const [, startTransition] = useTransition();

	const [events, setEvents] = useState<EventModel[]>([]);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [stations, setStations] = useState<StationModel[]>([]);
	const [loading, setLoading] = useState(true);

	const [searchQuery, setSearchQuery] = useState("");

	// Create / Edit Modal state
	const [modalMode, setModalMode] = useState<"CREATE" | "EDIT" | null>(null);
	const [editingEvent, setEditingEvent] = useState<EventModel | null>(null);
	const [formTitle, setFormTitle] = useState("");
	const [formDate, setFormDate] = useState("");
	const [formLocation, setFormLocation] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Delete Modal state
	const [eventToDelete, setEventToDelete] = useState<EventModel | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Toast notification
	const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

	const showNotification = (message: string, type: "success" | "error" = "success") => {
		setToast({ message, type });
		setTimeout(() => {
			setToast(null);
		}, 3500);
	};

	const fetchData = async () => {
		setLoading(true);
		try {
			const [eventsData, classesData, teamsData, stationsData] = await Promise.all([
				getEvents(),
				getClasses(),
				getTeams(),
				getStations(),
			]);
			setEvents(eventsData);
			setClasses(classesData);
			setTeams(teamsData);
			setStations(stationsData);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke hente begivenheder";
			showNotification(msg, "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Stats per event
	const eventStats = useMemo(() => {
		const map = new Map<number, { classes: number; teams: number; stations: number }>();
		events.forEach((ev) => {
			const evClasses = classes.filter((c) => c.eventId === ev.id).length;
			const evTeams = teams.filter((t) => t.eventId === ev.id).length;
			const evStations = stations.filter((s) => s.eventId === ev.id).length;
			map.set(ev.id, { classes: evClasses, teams: evTeams, stations: evStations });
		});
		return map;
	}, [events, classes, teams, stations]);

	// Filtered events
	const filteredEvents = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return events;
		return events.filter((ev) => {
			const matchesTitle = ev.title.toLowerCase().includes(q);
			const matchesDate = ev.date?.toLowerCase().includes(q);
			const matchesLocation = ev.location?.toLowerCase().includes(q);
			return matchesTitle || matchesDate || matchesLocation;
		});
	}, [events, searchQuery]);

	const handleOpenCreate = () => {
		setModalMode("CREATE");
		setEditingEvent(null);
		setFormTitle("");
		setFormDate(new Date().toISOString().split("T")[0]);
		setFormLocation("");
		setFormDescription("");
		setFormError(null);
	};

	const handleOpenEdit = (ev: EventModel) => {
		setModalMode("EDIT");
		setEditingEvent(ev);
		setFormTitle(ev.title);
		setFormDate(ev.date || "");
		setFormLocation(ev.location || "");
		setFormDescription(ev.description || "");
		setFormError(null);
	};

	const handleCloseModal = () => {
		setModalMode(null);
		setEditingEvent(null);
		setFormError(null);
	};

	const handleSaveForm = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		const trimmedTitle = formTitle.trim();
		if (!trimmedTitle) {
			setFormError("Event titel er påkrævet");
			return;
		}
		if (!formDate) {
			setFormError("Dato er påkrævet");
			return;
		}

		setIsSubmitting(true);
		try {
			if (modalMode === "CREATE") {
				const dto: CreateEventDTO = {
					title: trimmedTitle,
					date: formDate,
					location: formLocation.trim() || undefined,
					description: formDescription.trim() || undefined,
				};
				const created = await createEvent(dto);
				showNotification(`Begivenheden '${created.title}' er oprettet!`);
				handleCloseModal();
				await fetchData();
			} else if (modalMode === "EDIT" && editingEvent) {
				const dto: UpdateEventDTO = {
					title: trimmedTitle,
					date: formDate,
					location: formLocation.trim() || undefined,
					description: formDescription.trim() || undefined,
				};
				const updated = await updateEvent(editingEvent.id, dto);
				showNotification(`Begivenheden '${updated.title}' er opdateret!`);
				handleCloseModal();
				await fetchData();
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Handlingen mislykkedes";
			setFormError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!eventToDelete) return;
		setIsDeleting(true);
		try {
			await deleteEvent(eventToDelete.id);
			showNotification(`Begivenheden '${eventToDelete.title}' er slettet.`);
			setEventToDelete(null);
			await fetchData();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke slette begivenheden";
			showNotification(msg, "error");
		} finally {
			setIsDeleting(false);
		}
	};

	const formatDate = (dateStr: string) => {
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString("da-DK", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
			{/* Toast notification */}
			{toast && (
				<div
					className={cn(
						"fixed top-4 right-4 z-50 px-3.5 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 shadow-sm",
						toast.type === "success"
							? "bg-slate-900 text-white border-slate-800"
							: "bg-red-50 text-red-900 border-red-200"
					)}
				>
					{toast.type === "success" ? (
						<IconCheck size={16} className="text-emerald-400 shrink-0" />
					) : (
						<IconAlertTriangle size={16} className="text-red-600 shrink-0" />
					)}
					<span>{toast.message}</span>
				</div>
			)}

			{/* Top Navbar */}
			<header className="h-14 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
						<IconTrophy size={18} />
					</div>
					<div>
						<h1 className="font-bold text-sm text-slate-900 leading-tight">
							Skills Konkurrence
						</h1>
						<p className="text-[11px] text-slate-400">Kontrol Center</p>
					</div>
				</div>
				<span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
					Admin
				</span>
			</header>

			{/* Main Content Area */}
			<main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
				{/* Page Header with Actions */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold text-slate-900">Begivenheder</h2>
						<p className="text-xs text-slate-500 mt-1">
							Vælg en konkurrence-begivenhed for at administrere klasser, hold, stationer og konti.
						</p>
					</div>
					<button
						onClick={handleOpenCreate}
						className={cn(
							button(),
							"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
						)}
					>
						<IconPlus size={16} />
						<span>Opret Ny Begivenhed</span>
					</button>
				</div>

				{/* Search bar */}
				<div className="relative max-w-md">
					<IconSearch
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
					/>
					<input
						type="search"
						className={cn(textField(), "w-full pl-9 pr-3 py-2 text-xs")}
						placeholder="Søg begivenheder efter navn, dato eller sted..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{/* Events List */}
				{loading ? (
					<div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
						<IconLoader2 size={24} className="animate-spin" />
						<p className="text-xs">Henter begivenheder...</p>
					</div>
				) : filteredEvents.length === 0 ? (
					<div className={cn(card(), "p-8 text-center text-slate-400 space-y-2")}>
						<IconCalendar size={32} className="mx-auto opacity-30" />
						<h3 className="text-sm font-semibold text-slate-700">Ingen begivenheder fundet</h3>
						<p className="text-xs text-slate-400 max-w-xs mx-auto">
							{events.length === 0
								? "Der er endnu ikke oprettet nogen begivenheder. Opret din første konkurrencedag for at komme i gang."
								: "Ingen begivenheder matcher din søgning."}
						</p>
						<button
							onClick={handleOpenCreate}
							className={cn(button(), "mt-3 text-xs py-1.5 px-3")}
						>
							<IconPlus size={14} /> Opret begivenhed
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{filteredEvents.map((ev) => {
							const stats = eventStats.get(ev.id) || { classes: 0, teams: 0, stations: 0 };

							return (
								<div
									key={ev.id}
									className={cn(
										card(),
										"p-5 flex flex-col justify-between hover:border-slate-300 transition-colors group"
									)}
								>
									<div>
										{/* Card Header */}
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<Link
													href={`/admin/${ev.id}`}
													className="text-base font-bold text-slate-900 hover:underline block truncate"
												>
													{ev.title}
												</Link>
												<div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
													<span className="flex items-center gap-1">
														<IconCalendar size={14} className="text-slate-400" />
														{formatDate(ev.date)}
													</span>
													{ev.location && (
														<span className="flex items-center gap-1 truncate">
															<IconMapPin size={14} className="text-slate-400" />
															<span className="truncate">{ev.location}</span>
														</span>
													)}
												</div>
											</div>

											{/* Action Icons */}
											<div className="flex items-center gap-1 shrink-0">
												<button
													type="button"
													title="Rediger begivenhed"
													onClick={() => handleOpenEdit(ev)}
													className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
												>
													<IconEdit size={16} />
												</button>
												<button
													type="button"
													title="Slet begivenhed"
													onClick={() => setEventToDelete(ev)}
													className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
												>
													<IconTrash size={16} />
												</button>
											</div>
										</div>

										{/* Description if present */}
										{ev.description && (
											<p className="mt-2.5 text-xs text-slate-600 line-clamp-2">
												{ev.description}
											</p>
										)}

										{/* Metrics / Stats Badges */}
										<div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
											<div className="p-2 rounded bg-slate-50 border border-slate-100">
												<div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
													<IconSchool size={13} />
													<span>Klasser</span>
												</div>
												<div className="text-sm font-bold text-slate-800 mt-0.5">
													{stats.classes}
												</div>
											</div>
											<div className="p-2 rounded bg-slate-50 border border-slate-100">
												<div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
													<IconUsers size={13} />
													<span>Hold</span>
												</div>
												<div className="text-sm font-bold text-slate-800 mt-0.5">
													{stats.teams}
												</div>
											</div>
											<div className="p-2 rounded bg-slate-50 border border-slate-100">
												<div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
													<IconFlag size={13} />
													<span>Stationer</span>
												</div>
												<div className="text-sm font-bold text-slate-800 mt-0.5">
													{stats.stations}
												</div>
											</div>
										</div>
									</div>

									{/* Bottom Action Link */}
									<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
										<span className="text-[11px] font-mono text-slate-400">
											Event #{ev.id}
										</span>
										<Link
											href={`/admin/${ev.id}`}
											className={cn(
												button(),
												"px-3 py-1 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200 flex items-center gap-1"
											)}
										>
											<span>Åbn Kontrolcenter</span>
											<IconArrowRight size={13} />
										</Link>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</main>

			{/* Create / Edit Modal */}
			{modalMode && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-100">
					<div className={cn(card(), "p-6 max-w-md w-full space-y-4")}>
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<div>
								<h3 className="font-bold text-base text-slate-900">
									{modalMode === "CREATE" ? "Opret ny begivenhed" : "Rediger begivenhed"}
								</h3>
								<p className="text-xs text-slate-500 mt-0.5">
									{modalMode === "CREATE"
										? "Indtast information for det nye konkurrence-event."
										: `Opdater detaljer for ${editingEvent?.title}.`}
								</p>
							</div>
							<button
								onClick={handleCloseModal}
								className="text-slate-400 hover:text-slate-600 p-1"
							>
								<IconX size={18} />
							</button>
						</div>

						{formError && (
							<div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
								<IconAlertTriangle size={16} className="shrink-0" />
								<span>{formError}</span>
							</div>
						)}

						<form onSubmit={handleSaveForm} className="space-y-3.5">
							{/* Title */}
							<div>
								<label
									htmlFor="event-title"
									className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
								>
									Event Titel *
								</label>
								<input
									id="event-title"
									type="text"
									required
									placeholder="f.eks. Skills Konkurrence 2026"
									className={cn(textField(), "w-full py-2 px-3 text-sm")}
									value={formTitle}
									onChange={(e) => setFormTitle(e.target.value)}
								/>
							</div>

							{/* Date */}
							<div>
								<label
									htmlFor="event-date"
									className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
								>
									Dato *
								</label>
								<input
									id="event-date"
									type="date"
									required
									className={cn(textField(), "w-full py-2 px-3 text-sm")}
									value={formDate}
									onChange={(e) => setFormDate(e.target.value)}
								/>
							</div>

							{/* Location */}
							<div>
								<label
									htmlFor="event-location"
									className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
								>
									Lokation / Sted (valgfri)
								</label>
								<input
									id="event-location"
									type="text"
									placeholder="f.eks. Odense Kongrescenter eller Værkstedshallen"
									className={cn(textField(), "w-full py-2 px-3 text-sm")}
									value={formLocation}
									onChange={(e) => setFormLocation(e.target.value)}
								/>
							</div>

							{/* Description */}
							<div>
								<label
									htmlFor="event-description"
									className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
								>
									Beskrivelse (valgfri)
								</label>
								<textarea
									id="event-description"
									rows={3}
									placeholder="Kort beskrivelse af begivenheden..."
									className={cn(textField(), "w-full py-2 px-3 text-sm resize-none")}
									value={formDescription}
									onChange={(e) => setFormDescription(e.target.value)}
								/>
							</div>

							{/* Modal Actions */}
							<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
								<button
									type="button"
									onClick={handleCloseModal}
									className={cn(
										button(),
										"px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
									)}
								>
									Annuller
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className={cn(
										button(),
										"px-5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border-transparent flex items-center gap-1.5"
									)}
								>
									{isSubmitting && <IconLoader2 size={14} className="animate-spin" />}
									<span>{modalMode === "CREATE" ? "Opret Begivenhed" : "Gem Ændringer"}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{eventToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-100">
					<div className={cn(card(), "p-5 max-w-md w-full space-y-3.5")}>
						<div className="flex items-center gap-2.5 text-red-600">
							<div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
								<IconTrash size={18} />
							</div>
							<div>
								<h3 className="font-bold text-sm text-slate-900">Slet begivenhed</h3>
								<p className="text-[11px] text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-xs text-slate-600">
							Er du sikker på, at du vil slette begivenheden{" "}
							<span className="font-semibold text-slate-900">&quot;{eventToDelete.title}&quot;</span>?
						</p>

						<div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2">
							<IconAlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
							<span>
								<strong>Kritisk advarsel:</strong> Sletning af denne begivenhed vil permanent slette alle tilknyttede klasser, hold, stationer, brugerkonti og registrerede resultater for dette event!
							</span>
						</div>

						<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeleting}
								onClick={() => setEventToDelete(null)}
								className={cn(
									button(),
									"px-3 py-1 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
								)}
							>
								Annuller
							</button>
							<button
								type="button"
								disabled={isDeleting}
								onClick={handleDeleteConfirm}
								className={cn(
									button(),
									"px-4 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 border-transparent flex items-center gap-1.5"
								)}
							>
								{isDeleting && <IconLoader2 size={13} className="animate-spin" />}
								<span>Slet begivenhed</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
