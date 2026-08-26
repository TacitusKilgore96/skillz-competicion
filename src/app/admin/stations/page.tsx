"use client";

import { AdminShell } from "@/app/admin/shell";
import { cn } from "tailwind-variants";
import textField from "@/components/admin/TextField";
import { button } from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import { createStation, getClasses, getEvents, getStations, getTeams } from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, type FormEvent } from "react";
import card from "@/components/admin/Card";
import { EventSelector } from "@/components/admin/EventSelector";
import { useSelectedEvent } from "@/hooks/useSelectedEvent";

// ── Creation dialog ──────────────────────────────────────────────────────────

interface CreateDialogProps {
	events: EventModel[];
	defaultEventId: number | null;
	onClose: () => void;
	onCreated: (station: StationModel) => void;
}

function CreateStationDialog({ events, defaultEventId, onClose, onCreated }: CreateDialogProps) {
	const [name, setName] = useState("");
	const [eventId, setEventId] = useState<number>(() => {
		if (defaultEventId !== null && events.some(e => e.id === defaultEventId)) {
			return defaultEventId;
		}
		return events[0]?.id ?? 0;
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setError("Stationens navn er påkrævet.");
			return;
		}
		if (eventId === undefined || eventId === null) {
			setError("Du skal vælge en begivenhed.");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const created = await createStation({
				name: name.trim(),
				eventId: Number(eventId),
				entries: []
			});
			onCreated(created);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Noget gik galt.");
			setSaving(false);
		}
	}

	return (
		<div
			className={"fixed inset-0 z-50 flex items-center justify-center bg-black/40"}
			onClick={e => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div className={cn(card(), "bg-white p-8 flex flex-col gap-4 min-w-96 max-w-md w-full shadow-xl")}>
				<h2 className={"text-xl font-bold uppercase"}>Ny station</h2>

				<form onSubmit={handleSubmit} className={"flex flex-col gap-4"}>
					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>Navn på station</label>
						<input
							className={textField()}
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder={"F.eks. Præcision og Måling"}
							autoFocus
						/>
					</div>

					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>Tilknyttet begivenhed</label>
						<select
							className={cn(textField(), "cursor-pointer")}
							value={eventId}
							onChange={e => setEventId(Number(e.target.value))}
						>
							{events.length === 0 ? (
								<option value={0}>Ingen begivenheder oprettet endnu</option>
							) : (
								events.map(ev => (
									<option key={ev.id} value={ev.id}>
										{ev.name} ({ev.date}) [{ev.status}]
									</option>
								))
							)}
						</select>
					</div>

					{error && <p className={"text-red-500 text-sm"}>{error}</p>}

					<div className={"flex gap-2 justify-end pt-2"}>
						<button
							type={"button"}
							className={button({ shape: "pill" })}
							onClick={onClose}
							disabled={saving}
						>
							Annuller
						</button>
						<button
							type={"submit"}
							className={cn(button({ shape: "pill" }), "bg-hover text-white border-hover")}
							disabled={saving}
						>
							{saving ? "Opretter..." : "Opret"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

// ── Stations List Page ───────────────────────────────────────────────────────

export default function StationsPage() {
	const {
		data: stations,
		loading: loadingStations,
		error: errorStations,
		setData: setStations
	} = useAsync<StationModel[]>(getStations, []);

	const { data: events, loading: loadingEvents } = useAsync<EventModel[]>(getEvents, []);
	const { data: classes } = useAsync<ClassModel[]>(getClasses, []);
	const { data: teams } = useAsync<TeamModel[]>(getTeams, []);

	const { selectedEventId, setSelectedEventId } = useSelectedEvent();

	const router = useRouter();
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [search, setSearch] = useState("");

	function getEventName(eventId: number) {
		return events?.find(e => e.id === eventId)?.name ?? `Begivenhed #${eventId}`;
	}

	function getStationStatus(station: StationModel) {
		const stationClasses = classes?.filter(c => c.eventIds?.includes(station.eventId)) ?? [];
		const stationClassIds = new Set(stationClasses.map(c => c.id));
		const eligibleTeams = teams?.filter(t => stationClassIds.has(t.classId)) ?? [];
		
		const totalEligible = eligibleTeams.length;
		const setTimesCount = station.entries?.filter(e => e.time && e.time.trim() !== "").length ?? 0;

		return {
			totalEligible,
			setTimesCount,
			allSet: totalEligible > 0 && setTimesCount >= totalEligible,
			noneSet: setTimesCount === 0
		};
	}

	const filteredStations = stations?.filter(st => {
		// Event filter
		if (selectedEventId !== null && st.eventId !== selectedEventId) {
			return false;
		}

		// Search filter
		const eventName = getEventName(st.eventId);
		return (
			st.name.toLowerCase().includes(search.toLowerCase()) ||
			eventName.toLowerCase().includes(search.toLowerCase())
		);
	});

	function handleCreated(newStation: StationModel) {
		setStations(prev => [...(prev ?? []), newStation]);
		setShowCreateDialog(false);
		router.push(`/admin/stations/${newStation.id}`);
	}

	return (
		<AdminShell pageTitle={"Stationer"} currentPath={"/admin/stations"}>
			<div className={"p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full"}>
				{/* Event Selector Box */}
				<EventSelector
					events={events}
					selectedEventId={selectedEventId}
					onSelectEvent={setSelectedEventId}
					loading={loadingEvents}
				/>

				{/* Top Bar */}
				<div className={"flex items-center justify-between gap-4"}>
					<div className={"flex-1 max-w-md"}>
						<input
							className={textField()}
							placeholder={"Søg efter station eller begivenhed..."}
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>

					<button
						className={cn(button({ shape: "pill" }), "bg-hover text-white border-hover flex items-center gap-2 font-semibold")}
						onClick={() => setShowCreateDialog(true)}
					>
						<span>+</span>
						<span>Opret station</span>
					</button>
				</div>

				{/* Table / List */}
				<div className={cn(card(), "bg-white overflow-hidden")}>
					<div className={"grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500"}>
						<span className={"col-span-5"}>Stationsnavn</span>
						<span className={"col-span-4"}>Begivenhed</span>
						<span className={"col-span-3 text-right"}>Tidtagning</span>
					</div>

					<AsyncDataRenderer
						loading={loadingStations}
						error={errorStations}
						data={filteredStations ?? null}
						renderData={stationsList => {
							if (stationsList.length === 0) {
								return (
									<div className={"p-8 text-center text-gray-400"}>
										{selectedEventId !== null
											? "Ingen stationer fundet for den valgte begivenhed"
											: "Ingen stationer fundet"}
									</div>
								);
							}
							return (
								<div className={"divide-y divide-gray-100"}>
									{stationsList.map(station => {
										const event = events?.find(e => e.id === station.eventId);
										const status = getStationStatus(station);

										return (
											<Link
												key={station.id}
												href={`/admin/stations/${station.id}`}
												className={"grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"}
											>
												<span className={"col-span-5 font-semibold text-gray-800"}>
													{station.name}
												</span>
												<div className={"col-span-4 flex items-center gap-1.5"}>
													<span className={"px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 truncate"}>
														📅 {event?.name ?? `Begivenhed #${station.eventId}`}
													</span>
												</div>
												<div className={"col-span-3 flex justify-end"}>
													{status.totalEligible === 0 && status.setTimesCount === 0 ? (
														<span className={"px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"}>
															0 hold tilknyttet
														</span>
													) : status.allSet ? (
														<span className={"px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1"}>
															<span>✓</span> {status.setTimesCount}/{status.totalEligible} tider sat
														</span>
													) : status.setTimesCount > 0 ? (
														<span className={"px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"}>
															⏱️ {status.setTimesCount}/{status.totalEligible} sat
														</span>
													) : (
														<span className={"px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"}>
															Mangler tider ({status.totalEligible} hold)
														</span>
													)}
												</div>
											</Link>
										);
									})}
								</div>
							);
						}}
					/>
				</div>
			</div>

			{showCreateDialog && (
				<CreateStationDialog
					events={events ?? []}
					defaultEventId={selectedEventId}
					onClose={() => setShowCreateDialog(false)}
					onCreated={handleCreated}
				/>
			)}
		</AdminShell>
	);
}
