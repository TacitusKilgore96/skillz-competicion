"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "tailwind-variants";
import { EventShell } from "@/app/admin/shell";
import card from "@/components/admin/Card";
import { button } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import {
	IconSchool,
	IconUsers,
	IconFlag,
	IconKey,
	IconClock,
	IconArrowRight,
	IconCalendar,
	IconMapPin,
	IconLoader2,
	IconTrophy,
	IconPlayerPlay,
	IconPlayerPause,
	IconCheck,
	IconEye,
	IconEyeOff,
	IconSettings,
	IconAlertCircle,
	IconExternalLink,
	IconRefresh,
} from "@tabler/icons-react";
import {
	getEventById,
	getClasses,
	getTeams,
	getStations,
	getAccounts,
	getStationTimes,
	updateEvent,
} from "@/libs/API";
import { EventModel } from "@/models/EventModel";
import { ClassModel } from "@/models/ClassModel";
import { TeamModel } from "@/models/TeamModel";
import { StationModel, StationTimeModel } from "@/models/StationModel";
import { AccountModel } from "@/models/AccountModel";
import { computeEventTiming, formatTimeMMSS } from "@/libs/leaderboard";

export default function EventPage() {
	const params = useParams();
	const eventId = Number(params.eventId || 0);

	const [event, setEvent] = useState<EventModel | null>(null);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [stations, setStations] = useState<StationModel[]>([]);
	const [accounts, setAccounts] = useState<AccountModel[]>([]);
	const [times, setTimes] = useState<StationTimeModel[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);

	// Settings modal
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [editDuration, setEditDuration] = useState(120);
	const [editBlackout, setEditBlackout] = useState(30);

	// Ticker for live countdown
	const [, setTick] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setTick((t) => t + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const loadData = async () => {
		try {
			const [ev, cls, tm, st, acc, tmRecords] = await Promise.all([
				getEventById(eventId),
				getClasses({ eventId }),
				getTeams({ eventId }),
				getStations({ eventId }),
				getAccounts(),
				getStationTimes({ eventId }),
			]);
			setEvent(ev);
			setClasses(cls);
			setTeams(tm);
			setStations(st);
			setAccounts(acc);
			setTimes(tmRecords);
			if (ev) {
				setEditDuration(ev.durationMinutes || 120);
				setEditBlackout(ev.blackoutMinutes !== undefined ? ev.blackoutMinutes : 30);
			}
		} catch (e) {
			console.error("Error loading event dashboard:", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, [eventId]);

	const timing = useMemo(() => {
		return computeEventTiming(event);
	}, [event, event?.startedAt, event?.status, event?.isConfirmedOver]);

	// Handlers for event controls
	const handleStartEvent = async () => {
		if (!event) return;
		setActionLoading(true);
		try {
			const updated = await updateEvent(event.id, {
				status: "RUNNING",
				startedAt: new Date().toISOString(),
				endedAt: null,
				isConfirmedOver: false,
			});
			setEvent(updated);
		} catch (err) {
			console.error("Fejl ved start af event:", err);
		} finally {
			setActionLoading(false);
		}
	};

	const handleConfirmFinish = async () => {
		if (!event) return;
		const confirm = window.confirm(
			"Er du sikker på, at du vil afslutte eventet og offentliggøre de endelige resultater på storskærmen?"
		);
		if (!confirm) return;

		setActionLoading(true);
		try {
			const updated = await updateEvent(event.id, {
				status: "FINISHED",
				endedAt: new Date().toISOString(),
				isConfirmedOver: true,
			});
			setEvent(updated);
		} catch (err) {
			console.error("Fejl ved afslutning af event:", err);
		} finally {
			setActionLoading(false);
		}
	};

	const handleReopenEvent = async () => {
		if (!event) return;
		setActionLoading(true);
		try {
			const updated = await updateEvent(event.id, {
				status: "RUNNING",
				isConfirmedOver: false,
			});
			setEvent(updated);
		} catch (err) {
			console.error("Fejl ved genåbning af event:", err);
		} finally {
			setActionLoading(false);
		}
	};

	const handleResetEvent = async () => {
		if (!event) return;
		const confirm = window.confirm(
			"Vil du nulstille eventets status tilbage til 'Ikke startet'? (Registrerede tider bevares)"
		);
		if (!confirm) return;

		setActionLoading(true);
		try {
			const updated = await updateEvent(event.id, {
				status: "CREATED",
				startedAt: null,
				endedAt: null,
				isConfirmedOver: false,
			});
			setEvent(updated);
		} catch (err) {
			console.error("Fejl ved nulstilling af event:", err);
		} finally {
			setActionLoading(false);
		}
	};

	const handleSaveSettings = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!event) return;
		setActionLoading(true);
		try {
			const updated = await updateEvent(event.id, {
				durationMinutes: Number(editDuration),
				blackoutMinutes: Number(editBlackout),
			});
			setEvent(updated);
			setIsSettingsOpen(false);
		} catch (err) {
			console.error("Fejl ved opdatering af indstillinger:", err);
		} finally {
			setActionLoading(false);
		}
	};

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "";
		try {
			const d = new Date(dateStr);
			if (isNaN(d.getTime())) return dateStr;
			return d.toLocaleDateString("da-DK", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch {
			return dateStr;
		}
	};

	return (
		<EventShell pageTitle={event ? event.title : "Oversigt"}>
			<div className="p-6 max-w-6xl mx-auto space-y-6">
				{loading ? (
					<div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
						<IconLoader2 size={24} className="animate-spin" />
						<p className="text-xs">Indlæser event oversigt...</p>
					</div>
				) : (
					<>
						{/* Event Banner */}
						<div className={cn(card(), "p-6 bg-white space-y-6")}>
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
								<div>
									<div className="flex items-center gap-2">
										<h2 className="text-2xl font-bold text-slate-900">
											{event?.title || `Event #${eventId}`}
										</h2>
										{/* Status Pill */}
										{event?.status === "RUNNING" && !timing.isBlackout && (
											<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-pulse">
												<span className="w-2 h-2 rounded-full bg-emerald-500" />
												I Gang (Live)
											</span>
										)}
										{event?.status === "RUNNING" && timing.isBlackout && timing.remainingSeconds > 0 && (
											<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 animate-pulse">
												<IconEyeOff size={13} className="text-amber-700" />
												Spændingstilstand (Skjult)
											</span>
										)}
										{event?.status === "RUNNING" && timing.remainingSeconds === 0 && (
											<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
												<IconClock size={13} />
												Tid Udløbet (Afventer Bekræftelse)
											</span>
										)}
										{event?.status === "FINISHED" && (
											<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900">
												<IconTrophy size={13} />
												Afsluttet & Offentliggjort
											</span>
										)}
										{(!event?.status || event?.status === "CREATED") && (
											<span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
												Ikke startet
											</span>
										)}
									</div>

									<div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
										{event?.date && (
											<span className="flex items-center gap-1.5 capitalize">
												<IconCalendar size={15} className="text-slate-400" />
												{formatDate(event.date)}
											</span>
										)}
										{event?.location && (
											<span className="flex items-center gap-1.5">
												<IconMapPin size={15} className="text-slate-400" />
												{event.location}
											</span>
										)}
										<span className="flex items-center gap-1.5">
											<IconClock size={15} className="text-slate-400" />
											Varighed: {event?.durationMinutes || 120} min (Skjult de sidste {event?.blackoutMinutes ?? 30} min)
										</span>
									</div>

									{event?.description && (
										<p className="mt-2 text-xs text-slate-600 max-w-2xl leading-relaxed">
											{event.description}
										</p>
									)}
								</div>

								{/* Top Right Quick Actions */}
								<div className="flex flex-wrap items-center gap-2 shrink-0">
									<Link
										href="/results"
										target="_blank"
										className={cn(
											button(),
											"bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200 px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
										)}
										title="Åbn storskærm / leaderboard"
									>
										<IconTrophy size={15} className="text-amber-500" />
										<span>Åbn Storskærm</span>
										<IconExternalLink size={13} className="text-slate-400" />
									</Link>

									<button
										type="button"
										onClick={() => setIsSettingsOpen(true)}
										className={cn(
											button(),
											"bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
										)}
										title="Indstil varighed og suspense"
									>
										<IconSettings size={15} />
										<span>Tid & Regler</span>
									</button>
								</div>
							</div>

							{/* Live Control Center Strip */}
							<div className="pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-lg">
								<div className="flex items-center gap-6">
									<div>
										<div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
											Resterende Konkurrencetid
										</div>
										<div className="text-3xl font-black font-mono tracking-tight text-slate-900 mt-0.5">
											{event?.status === "RUNNING"
												? timing.formattedRemaining
												: `${String(event?.durationMinutes || 120).padStart(2, "0")}:00`}
										</div>
									</div>

									{event?.status === "RUNNING" && (
										<div className="hidden sm:block border-l border-slate-200 pl-6">
											<div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
												Storskærm Tilstand
											</div>
											<div className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1.5">
												{timing.isBlackout ? (
													<>
														<IconEyeOff size={16} className="text-amber-600" />
														<span className="text-amber-700">Skjult for spænding</span>
													</>
												) : (
													<>
														<IconEye size={16} className="text-emerald-600" />
														<span className="text-emerald-700">Offentlig Live Stilling</span>
													</>
												)}
											</div>
										</div>
									)}
								</div>

								{/* Control Buttons */}
								<div className="flex flex-wrap items-center gap-2">
									{(!event?.status || event?.status === "CREATED") && (
										<button
											type="button"
											disabled={actionLoading}
											onClick={handleStartEvent}
											className={cn(
												button(),
												"bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 border-0 shadow-sm"
											)}
										>
											{actionLoading ? (
												<IconLoader2 size={16} className="animate-spin" />
											) : (
												<IconPlayerPlay size={16} />
											)}
											<span>Start Konkurrence</span>
										</button>
									)}

									{event?.status === "RUNNING" && (
										<>
											<button
												type="button"
												disabled={actionLoading}
												onClick={handleConfirmFinish}
												className={cn(
													button(),
													"bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 border-0 shadow-sm"
												)}
											>
												{actionLoading ? (
													<IconLoader2 size={16} className="animate-spin" />
												) : (
													<IconTrophy size={16} />
												)}
												<span>Bekræft & Offentliggør Resultater</span>
											</button>

											<button
												type="button"
												disabled={actionLoading}
												onClick={handleResetEvent}
												className={cn(
													button(),
													"bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 border-0"
												)}
												title="Nulstil til Ikke startet"
											>
												<IconRefresh size={14} />
												<span>Nulstil</span>
											</button>
										</>
									)}

									{event?.status === "FINISHED" && (
										<button
											type="button"
											disabled={actionLoading}
											onClick={handleReopenEvent}
											className={cn(
												button(),
												"bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 border-0"
											)}
										>
											<IconRefresh size={14} />
											<span>Genåbn Konkurrence</span>
										</button>
									)}
								</div>
							</div>
						</div>

						{/* Quick Stat Tiles */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
							<Link
								href={`/admin/${eventId}/classes`}
								className={cn(
									card(),
									"p-4 hover:border-slate-300 transition-colors group cursor-pointer"
								)}
							>
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
										Klasser
									</span>
									<div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
										<IconSchool size={17} />
									</div>
								</div>
								<div className="text-2xl font-bold text-slate-900 mt-2">
									{classes.length}
								</div>
								<div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-slate-600">
									<span>Administrer klasser</span>
									<IconArrowRight size={12} />
								</div>
							</Link>

							<Link
								href={`/admin/${eventId}/teams`}
								className={cn(
									card(),
									"p-4 hover:border-slate-300 transition-colors group cursor-pointer"
								)}
							>
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
										Hold
									</span>
									<div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
										<IconUsers size={17} />
									</div>
								</div>
								<div className="text-2xl font-bold text-slate-900 mt-2">
									{teams.length}
								</div>
								<div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-slate-600">
									<span>Administrer hold</span>
									<IconArrowRight size={12} />
								</div>
							</Link>

							<Link
								href={`/admin/${eventId}/stations`}
								className={cn(
									card(),
									"p-4 hover:border-slate-300 transition-colors group cursor-pointer"
								)}
							>
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
										Stationer
									</span>
									<div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
										<IconFlag size={17} />
									</div>
								</div>
								<div className="text-2xl font-bold text-slate-900 mt-2">
									{stations.length}
								</div>
								<div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-slate-600">
									<span>Administrer stationer</span>
									<IconArrowRight size={12} />
								</div>
							</Link>

							<Link
								href={`/admin/${eventId}/accounts`}
								className={cn(
									card(),
									"p-4 hover:border-slate-300 transition-colors group cursor-pointer"
								)}
							>
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
										Tidsregistreringer
									</span>
									<div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
										<IconClock size={17} />
									</div>
								</div>
								<div className="text-2xl font-bold text-slate-900 mt-2">
									{times.length}
								</div>
								<div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-slate-600">
									<span>Se resultater & konti</span>
									<IconArrowRight size={12} />
								</div>
							</Link>
						</div>

						{/* Quick Navigation Sections */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Stations Overview */}
							<div className={cn(card(), "p-5 space-y-3")}>
								<div className="flex items-center justify-between pb-2 border-b border-slate-100">
									<h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
										<IconFlag size={16} className="text-slate-500" />
										<span>Stationer ({stations.length})</span>
									</h3>
									<Link
										href={`/admin/${eventId}/stations`}
										className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
									>
										<span>Se alle</span>
										<IconArrowRight size={12} />
									</Link>
								</div>

								{stations.length === 0 ? (
									<p className="text-xs text-slate-400 py-3 text-center">
										Ingen stationer oprettet endnu.
									</p>
								) : (
									<ul className="divide-y divide-slate-100">
										{stations.slice(0, 5).map((st) => {
											const stationTimesCount = times.filter(
												(t) => t.stationId === st.id
											).length;
											return (
												<li key={st.id} className="py-2 flex items-center justify-between text-xs">
													<div className="min-w-0">
														<span className="font-medium text-slate-800 truncate block">
															{st.name}
														</span>
														{st.location && (
															<span className="text-[11px] text-slate-400">
																{st.location}
															</span>
														)}
													</div>
													<span className="text-[11px] font-medium text-slate-500 shrink-0">
														{stationTimesCount} tider
													</span>
												</li>
											);
										})}
									</ul>
								)}
							</div>

							{/* Classes & Teams Overview */}
							<div className={cn(card(), "p-5 space-y-3")}>
								<div className="flex items-center justify-between pb-2 border-b border-slate-100">
									<h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
										<IconSchool size={16} className="text-slate-500" />
										<span>Klasser ({classes.length})</span>
									</h3>
									<Link
										href={`/admin/${eventId}/classes`}
										className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
									>
										<span>Se alle</span>
										<IconArrowRight size={12} />
									</Link>
								</div>

								{classes.length === 0 ? (
									<p className="text-xs text-slate-400 py-3 text-center">
										Ingen klasser oprettet endnu.
									</p>
								) : (
									<ul className="divide-y divide-slate-100">
										{classes.slice(0, 5).map((cls) => {
											const classTeamsCount = teams.filter(
												(t) => t.classId === cls.id
											).length;
											return (
												<li key={cls.id} className="py-2 flex items-center justify-between text-xs">
													<div className="min-w-0">
														<span className="font-medium text-slate-800 truncate block">
															{cls.name}
														</span>
														<span className="text-[11px] text-slate-400">
															{cls.school}
														</span>
													</div>
													<span className="text-[11px] font-medium text-slate-500 shrink-0">
														{classTeamsCount} hold
													</span>
												</li>
											);
										})}
									</ul>
								)}
							</div>
						</div>
					</>
				)}
			</div>

			{/* Settings Modal: Duration & Blackout */}
			{isSettingsOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs p-4 animate-in fade-in duration-100">
					<div className={cn(card(), "p-6 max-w-md w-full space-y-4")}>
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<div>
								<h3 className="font-bold text-base text-slate-900">
									Tids- og Spændingsindstillinger
								</h3>
								<p className="text-xs text-slate-500 mt-0.5">
									Styr konkurrencens varighed og hvornår stillingen skjules
								</p>
							</div>
						</div>

						<form onSubmit={handleSaveSettings} className="space-y-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
									Samlet Varighed (i minutter)
								</label>
								<input
									type="number"
									min={5}
									max={480}
									required
									value={editDuration}
									onChange={(e) => setEditDuration(Number(e.target.value))}
									className={cn(textField(), "w-full py-2 px-3 text-sm")}
								/>
								<span className="text-[11px] text-slate-400 mt-1 block">
									F.eks. 90 eller 120 minutter. Tælleren tæller ned automatisk ved start.
								</span>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
									Spændingsvindue (i minutter før slut)
								</label>
								<input
									type="number"
									min={0}
									max={editDuration}
									required
									value={editBlackout}
									onChange={(e) => setEditBlackout(Number(e.target.value))}
									className={cn(textField(), "w-full py-2 px-3 text-sm")}
								/>
								<span className="text-[11px] text-slate-400 mt-1 block">
									Standard er 30 min. Når der er 30 min tilbage, skjules stillingen for tilskuerne for at skabe spænding.
								</span>
							</div>

							<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setIsSettingsOpen(false)}
									className={cn(
										button(),
										"px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
									)}
								>
									Annuller
								</button>
								<button
									type="submit"
									disabled={actionLoading}
									className={cn(
										button(),
										"px-5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border-transparent flex items-center gap-1.5"
									)}
								>
									{actionLoading && <IconLoader2 size={14} className="animate-spin" />}
									<span>Gem Indstillinger</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</EventShell>
	);
}
