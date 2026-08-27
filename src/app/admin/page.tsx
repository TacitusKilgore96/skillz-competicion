"use client";

import { AdminShell } from "@/app/admin/shell";
import { cn } from "tailwind-variants";
import { button } from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {
	getAccounts,
	getClasses,
	getEvents,
	getSchools,
	getStations,
	getTeams,
} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import Link from "next/link";
import React from "react";
import card from "@/components/admin/Card";
import { EventSelector } from "@/components/admin/EventSelector";
import { useSelectedEvent } from "@/hooks/useSelectedEvent";
import type { AccountModel } from "@/models/AccountModel";

function formatToDisplayDate(dateStr?: string): string {
	if (!dateStr) return "";
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		const [year, month, day] = dateStr.split("-");
		return `${day}-${month}-${year}`;
	}
	return dateStr;
}

export default function OverviewPage() {
	const { selectedEventId, setSelectedEventId } = useSelectedEvent();

	const {
		data: events,
		loading: loadingEvents,
		error: errorEvents,
	} = useAsync<EventModel[]>(getEvents, []);

	const {
		data: schools,
		loading: loadingSchools,
		error: errorSchools,
	} = useAsync<SchoolModel[]>(getSchools, []);

	const {
		data: classes,
		loading: loadingClasses,
		error: errorClasses,
	} = useAsync<ClassModel[]>(getClasses, []);

	const {
		data: teams,
		loading: loadingTeams,
		error: errorTeams,
	} = useAsync<TeamModel[]>(getTeams, []);

	const {
		data: stations,
		loading: loadingStations,
		error: errorStations,
	} = useAsync<StationModel[]>(getStations, []);

	const {
		data: accounts,
		loading: loadingAccounts,
		error: errorAccounts,
	} = useAsync<AccountModel[]>(getAccounts, []);

	const isLoading =
		loadingEvents ||
		loadingSchools ||
		loadingClasses ||
		loadingTeams ||
		loadingStations ||
		loadingAccounts;

	const hasError =
		errorEvents ||
		errorSchools ||
		errorClasses ||
		errorTeams ||
		errorStations ||
		errorAccounts;

	// Computed event context
	const selectedEvent = events?.find((e) => e.id === selectedEventId);

	// Event-filtered entities
	const filteredClasses = classes?.filter((c) =>
		selectedEventId !== null ? c.eventIds?.includes(selectedEventId) : true
	) ?? [];

	const filteredClassIds = new Set(filteredClasses.map((c) => c.id));

	const filteredTeams = teams?.filter((t) =>
		selectedEventId !== null ? filteredClassIds.has(t.classId) : true
	) ?? [];

	const filteredStations = stations?.filter((s) =>
		selectedEventId !== null ? s.eventId === selectedEventId : true
	) ?? [];

	const participatingSchoolIds = new Set(filteredClasses.map((c) => c.schoolId));
	const filteredSchoolsCount = selectedEventId !== null
		? participatingSchoolIds.size
		: (schools?.length ?? 0);

	// Accounts breakdown
	const organizerCount = accounts?.filter((a) => a.role === "ORGANIZER").length ?? 0;
	const guardCount = accounts?.filter((a) => a.role === "STATION_GUARD").length ?? 0;
	const leaderCount = accounts?.filter((a) => a.role === "TEAM_LEADER").length ?? 0;
	const sharedTeamCount = accounts?.filter((a) => a.role === "SHARED_TEAM").length ?? 0;

	// Station time statistics for the active context
	let totalStationOpportunities = 0;
	let recordedTimesCount = 0;

	filteredStations.forEach((station) => {
		const stationClasses = classes?.filter((c) => c.eventIds?.includes(station.eventId)) ?? [];
		const stationClassIds = new Set(stationClasses.map((c) => c.id));
		const eligibleTeams = teams?.filter((t) => stationClassIds.has(t.classId)) ?? [];
		
		totalStationOpportunities += eligibleTeams.length;
		const setEntries = station.entries?.filter((e) => e.time && e.time.trim() !== "").length ?? 0;
		recordedTimesCount += setEntries;
	});

	const timeProgressPercent = totalStationOpportunities > 0
		? Math.round((recordedTimesCount / totalStationOpportunities) * 100)
		: 0;

	return (
		<AdminShell pageTitle={"Oversigt"} currentPath={"/admin"}>
			<div className={"p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full"}>
				{/* Top Bar with Event Selector */}
				<div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-4"}>
					<div>
						<h2 className={"text-2xl font-black text-gray-900 tracking-tight"}>
							Kontrol Center Dashboard
						</h2>
						<p className={"text-sm text-gray-500 mt-0.5"}>
							Samlet overblik over begivenheder, skoler, klasser, hold, stationer og konti.
						</p>
					</div>

					<div className={"w-full sm:w-auto"}>
						<EventSelector
							events={events ?? []}
							selectedEventId={selectedEventId}
							onSelectEvent={setSelectedEventId}
							loading={loadingEvents}
						/>
					</div>
				</div>

				<AsyncDataRenderer
					loading={isLoading}
					error={hasError}
					data={events ?? null}
					renderData={() => (
						<div className={"flex flex-col gap-8"}>
							{/* Active Event Banner / Context */}
							{selectedEvent ? (
								<div className={cn(card(), "bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden")}>
									<div className={"relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6"}>
										<div className={"flex flex-col gap-2"}>
											<div className={"flex items-center gap-2.5"}>
												<span className={"text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30"}>
													Aktivt Filter
												</span>
												<span className={cn(
													"text-xs uppercase font-bold px-2.5 py-0.5 rounded-full",
													selectedEvent.status === "ACTIVE"
														? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
														: selectedEvent.status === "READY"
														? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
														: "bg-amber-500/20 text-amber-300 border border-amber-400/30"
												)}>
													{selectedEvent.status}
												</span>
											</div>
											<h3 className={"text-2xl sm:text-3xl font-extrabold tracking-tight"}>
												{selectedEvent.name}
											</h3>
											<p className={"text-blue-200 text-sm flex items-center gap-2"}>
												<span>📅 Dato: {formatToDisplayDate(selectedEvent.date)}</span>
												<span>•</span>
												<span>{filteredSchoolsCount} skoler tilknyttet</span>
												<span>•</span>
												<span>{filteredClasses.length} klasser</span>
												<span>•</span>
												<span>{filteredTeams.length} hold</span>
											</p>
										</div>

										<div className={"flex flex-wrap items-center gap-3"}>
											<Link
												href={`/admin/events/${selectedEvent.id}`}
												className={cn(button({ shape: "pill" }), "bg-white text-gray-900 hover:bg-gray-100 font-bold text-sm shadow")}
											>
												Rediger begivenhed →
											</Link>
											<Link
												href={"/admin/stations"}
												className={cn(button({ shape: "pill" }), "bg-white/10 text-white hover:bg-white/20 border-white/20 font-bold text-sm")}
											>
												Se stationer & tider
											</Link>
										</div>
									</div>
								</div>
							) : (
								<div className={cn(card(), "bg-gradient-to-r from-gray-900 to-slate-800 text-white p-6 sm:p-8 shadow-md")}>
									<div className={"flex flex-col md:flex-row md:items-center justify-between gap-6"}>
										<div className={"flex flex-col gap-1.5"}>
											<div className={"flex items-center gap-2"}>
												<span className={"text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300"}>
													Global Visning
												</span>
												<span className={"text-xs text-gray-400"}>Alle begivenheder</span>
											</div>
											<h3 className={"text-2xl sm:text-3xl font-extrabold tracking-tight"}>
												Skills Competition Hovedoverblik
											</h3>
											<p className={"text-gray-300 text-sm"}>
												Viser statistik og data på tværs af samtlige {events?.length ?? 0} begivenheder og {schools?.length ?? 0} skoler.
											</p>
										</div>

										<div className={"flex items-center gap-3"}>
											<Link
												href={"/admin/events"}
												className={cn(button({ shape: "pill" }), "bg-white text-gray-900 hover:bg-gray-100 font-bold text-sm shadow")}
											>
												Gå til Begivenheder →
											</Link>
										</div>
									</div>
								</div>
							)}

							{/* Key Metrics Grid */}
							<div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"}>
								{/* Begivenheder */}
								<Link
									href={"/admin/events"}
									className={cn(card(), "bg-white p-5 flex flex-col justify-between hover:shadow-md transition-all hover:border-gray-300 group")}
								>
									<div className={"flex items-center justify-between"}>
										<span className={"text-xs font-bold text-gray-500 uppercase tracking-wider"}>
											Begivenheder
										</span>
										<span className={"text-lg group-hover:scale-110 transition-transform"}>📅</span>
									</div>
									<div className={"mt-4"}>
										<div className={"text-3xl font-black text-gray-900"}>
											{events?.length ?? 0}
										</div>
										<p className={"text-xs text-gray-500 mt-1 truncate"}>
											{events?.filter((e) => e.status === "ACTIVE").length ?? 0} aktive begivenheder
										</p>
									</div>
								</Link>

								{/* Skoler */}
								<Link
									href={"/admin/schools"}
									className={cn(card(), "bg-white p-5 flex flex-col justify-between hover:shadow-md transition-all hover:border-gray-300 group")}
								>
									<div className={"flex items-center justify-between"}>
										<span className={"text-xs font-bold text-gray-500 uppercase tracking-wider"}>
											Skoler
										</span>
										<span className={"text-lg group-hover:scale-110 transition-transform"}>🏫</span>
									</div>
									<div className={"mt-4"}>
										<div className={"text-3xl font-black text-gray-900"}>
											{filteredSchoolsCount}
										</div>
										<p className={"text-xs text-gray-500 mt-1 truncate"}>
											{selectedEventId !== null ? "i valgt begivenhed" : "skoler i alt"}
										</p>
									</div>
								</Link>

								{/* Klasser */}
								<Link
									href={"/admin/classes"}
									className={cn(card(), "bg-white p-5 flex flex-col justify-between hover:shadow-md transition-all hover:border-gray-300 group")}
								>
									<div className={"flex items-center justify-between"}>
										<span className={"text-xs font-bold text-gray-500 uppercase tracking-wider"}>
											Klasser
										</span>
										<span className={"text-lg group-hover:scale-110 transition-transform"}>🎓</span>
									</div>
									<div className={"mt-4"}>
										<div className={"text-3xl font-black text-gray-900"}>
											{filteredClasses.length}
										</div>
										<p className={"text-xs text-gray-500 mt-1 truncate"}>
											{selectedEventId !== null ? `af ${classes?.length ?? 0} klasser i alt` : "klasser oprettet"}
										</p>
									</div>
								</Link>

								{/* Hold */}
								<Link
									href={"/admin/teams"}
									className={cn(card(), "bg-white p-5 flex flex-col justify-between hover:shadow-md transition-all hover:border-gray-300 group")}
								>
									<div className={"flex items-center justify-between"}>
										<span className={"text-xs font-bold text-gray-500 uppercase tracking-wider"}>
											Hold
										</span>
										<span className={"text-lg group-hover:scale-110 transition-transform"}>👥</span>
									</div>
									<div className={"mt-4"}>
										<div className={"text-3xl font-black text-gray-900"}>
											{filteredTeams.length}
										</div>
										<p className={"text-xs text-gray-500 mt-1 truncate"}>
											{selectedEventId !== null ? `af ${teams?.length ?? 0} hold i alt` : "deltagende hold"}
										</p>
									</div>
								</Link>

								{/* Stationer / Poster */}
								<Link
									href={"/admin/stations"}
									className={cn(card(), "bg-white p-5 flex flex-col justify-between hover:shadow-md transition-all hover:border-gray-300 group")}
								>
									<div className={"flex items-center justify-between"}>
										<span className={"text-xs font-bold text-gray-500 uppercase tracking-wider"}>
											Stationer / Poster
										</span>
										<span className={"text-lg group-hover:scale-110 transition-transform"}>📍</span>
									</div>
									<div className={"mt-4"}>
										<div className={"text-3xl font-black text-gray-900"}>
											{filteredStations.length}
										</div>
										<p className={"text-xs text-gray-500 mt-1 truncate"}>
											{totalStationOpportunities > 0 ? `${recordedTimesCount}/${totalStationOpportunities} tider sat` : "poster oprettet"}
										</p>
									</div>
								</Link>

								{/* Konti */}
								<Link
									href={"/admin/accounts"}
									className={cn(card(), "bg-white p-5 flex flex-col justify-between hover:shadow-md transition-all hover:border-gray-300 group")}
								>
									<div className={"flex items-center justify-between"}>
										<span className={"text-xs font-bold text-gray-500 uppercase tracking-wider"}>
											Brugere / Konti
										</span>
										<span className={"text-lg group-hover:scale-110 transition-transform"}>🔐</span>
									</div>
									<div className={"mt-4"}>
										<div className={"text-3xl font-black text-gray-900"}>
											{accounts?.length ?? 0}
										</div>
										<p className={"text-xs text-gray-500 mt-1 truncate"}>
											{organizerCount} arrangører, {guardCount} vagter
										</p>
									</div>
								</Link>
							</div>

							{/* Two Column Layout: Station Progress & Quick Management */}
							<div className={"grid grid-cols-1 lg:grid-cols-12 gap-8"}>
								{/* Left Column: Station Activity & Timings */}
								<div className={"lg:col-span-7 flex flex-col gap-6"}>
									<div className={cn(card(), "bg-white p-6 flex flex-col gap-5 shadow-sm")}>
										<div className={"flex items-center justify-between pb-3 border-b border-gray-100"}>
											<div>
												<h3 className={"text-lg font-bold text-gray-900"}>
													Postaktivitet & Tidsregistrering
												</h3>
												<p className={"text-xs text-gray-500 mt-0.5"}>
													{selectedEvent ? `Status for stationer i ${selectedEvent.name}` : "Status for alle aktive stationer"}
												</p>
											</div>

											<Link
												href={"/admin/stations"}
												className={"text-xs font-semibold text-blue-600 hover:underline"}
											>
												Se alle stationer →
											</Link>
										</div>

										{/* Progress Bar */}
										<div className={"flex flex-col gap-2"}>
											<div className={"flex items-center justify-between text-xs font-medium"}>
												<span className={"text-gray-600"}>Samlet fuldførelse af tider:</span>
												<span className={"font-bold text-gray-900"}>
													{timeProgressPercent}% ({recordedTimesCount} / {totalStationOpportunities} tider)
												</span>
											</div>
											<div className={"w-full h-3 bg-gray-100 rounded-full overflow-hidden"}>
												<div
													className={cn(
														"h-full rounded-full transition-all duration-500",
														timeProgressPercent === 100
															? "bg-emerald-500"
															: timeProgressPercent > 0
															? "bg-blue-600"
															: "bg-gray-300"
													)}
													style={{ width: `${timeProgressPercent}%` }}
												/>
											</div>
										</div>

										{/* Station List Preview */}
										<div className={"flex flex-col divide-y divide-gray-100 pt-1"}>
											{filteredStations.length === 0 ? (
												<div className={"py-6 text-center text-gray-400 text-sm"}>
													Ingen stationer fundet i denne visning.
												</div>
											) : (
												filteredStations.map((st) => {
													const stationClasses = classes?.filter((c) => c.eventIds?.includes(st.eventId)) ?? [];
													const stationClassIds = new Set(stationClasses.map((c) => c.id));
													const eligibleTeams = teams?.filter((t) => stationClassIds.has(t.classId)) ?? [];
													const setTimes = st.entries?.filter((e) => e.time && e.time.trim() !== "").length ?? 0;
													const isDone = eligibleTeams.length > 0 && setTimes >= eligibleTeams.length;

													return (
														<Link
															key={st.id}
															href={`/admin/stations/${st.id}`}
															className={"py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors group"}
														>
															<div className={"flex items-center gap-3"}>
																<span className={"p-2 rounded-lg bg-gray-100 text-gray-700 font-mono text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors"}>
																	#{st.id}
																</span>
																<div>
																	<h4 className={"text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"}>
																		{st.name}
																	</h4>
																	<p className={"text-xs text-gray-500"}>
																		{events?.find((e) => e.id === st.eventId)?.name ?? `Begivenhed #${st.eventId}`}
																	</p>
																</div>
															</div>

															<div className={"flex items-center gap-3"}>
																<span className={cn(
																	"px-2.5 py-0.5 rounded-full text-xs font-semibold",
																	eligibleTeams.length === 0
																		? "bg-gray-100 text-gray-600"
																		: isDone
																		? "bg-emerald-100 text-emerald-700"
																		: setTimes > 0
																		? "bg-blue-100 text-blue-700"
																		: "bg-amber-100 text-amber-700"
																)}>
																	{setTimes} / {eligibleTeams.length} sat
																</span>
																<span className={"text-gray-400 text-sm group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all"}>
																	→
																</span>
															</div>
														</Link>
													);
												})
											)}
										</div>
									</div>

									{/* Account & Role Overview */}
									<div className={cn(card(), "bg-white p-6 flex flex-col gap-4 shadow-sm")}>
										<div className={"flex items-center justify-between pb-3 border-b border-gray-100"}>
											<div>
												<h3 className={"text-lg font-bold text-gray-900"}>
													Brugere & Adgangsrettigheder
												</h3>
												<p className={"text-xs text-gray-500 mt-0.5"}>
													Oversigt over oprettede kontotyper og deres tilknytninger
												</p>
											</div>

											<Link
												href={"/admin/accounts"}
												className={"text-xs font-semibold text-blue-600 hover:underline"}
											>
												Administrer konti →
											</Link>
										</div>

										<div className={"grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1"}>
											{/* Organizer Card */}
											<div className={"p-3.5 bg-purple-50/60 rounded-xl border border-purple-200/80 flex flex-col justify-between"}>
												<div className={"flex items-center justify-between"}>
													<span className={"text-xs font-bold text-purple-900 uppercase"}>Arrangører</span>
													<span className={"text-xs px-2 py-0.5 rounded-full font-bold bg-purple-200 text-purple-800"}>
														{organizerCount}
													</span>
												</div>
												<p className={"text-xs text-purple-700 mt-2"}>
													Fuld adgang til Kontrol Centeret. Oprettes kun manuelt.
												</p>
											</div>

											{/* Station Guard Card */}
											<div className={"p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 flex flex-col justify-between"}>
												<div className={"flex items-center justify-between"}>
													<span className={"text-xs font-bold text-amber-900 uppercase"}>Stationsvagter</span>
													<span className={"text-xs px-2 py-0.5 rounded-full font-bold bg-amber-200 text-amber-800"}>
														{guardCount}
													</span>
												</div>
												<p className={"text-xs text-amber-700 mt-2"}>
													Knyttet til en specifik station/post for tidsregistrering.
												</p>
											</div>

											{/* Team Leader Card */}
											<div className={"p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 flex flex-col justify-between"}>
												<div className={"flex items-center justify-between"}>
													<span className={"text-xs font-bold text-blue-900 uppercase"}>Holdledere</span>
													<span className={"text-xs px-2 py-0.5 rounded-full font-bold bg-blue-200 text-blue-800"}>
														{leaderCount}
													</span>
												</div>
												<p className={"text-xs text-blue-700 mt-2"}>
													Knyttet til et hold (lærere/ledere). Auto-oprettes med holdet.
												</p>
											</div>

											{/* Shared Team Card */}
											<div className={"p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex flex-col justify-between"}>
												<div className={"flex items-center justify-between"}>
													<span className={"text-xs font-bold text-emerald-900 uppercase"}>Fælles Holdkonti</span>
													<span className={"text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-200 text-emerald-800"}>
														{sharedTeamCount}
													</span>
												</div>
												<p className={"text-xs text-emerald-700 mt-2"}>
													Delt PIN-kode for holdmedlemmer til statistik.
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Right Column: Events List & Quick Navigation Shortcuts */}
								<div className={"lg:col-span-5 flex flex-col gap-6"}>
									{/* Begivenheder List Card */}
									<div className={cn(card(), "bg-white p-6 flex flex-col gap-4 shadow-sm")}>
										<div className={"flex items-center justify-between pb-3 border-b border-gray-100"}>
											<div>
												<h3 className={"text-lg font-bold text-gray-900"}>
													Begivenheder
												</h3>
												<p className={"text-xs text-gray-500 mt-0.5"}>
													Seneste og aktive begivenheder
												</p>
											</div>

											<Link
												href={"/admin/events"}
												className={"text-xs font-semibold text-blue-600 hover:underline"}
											>
												Administrer →
											</Link>
										</div>

										<div className={"flex flex-col divide-y divide-gray-100"}>
											{events?.map((ev) => {
												const evClasses = classes?.filter((c) => c.eventIds?.includes(ev.id)) ?? [];
												const evStations = stations?.filter((s) => s.eventId === ev.id) ?? [];

												return (
													<Link
														key={ev.id}
														href={`/admin/events/${ev.id}`}
														className={"py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors group"}
													>
														<div className={"flex flex-col"}>
															<span className={"text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors"}>
																{ev.name}
															</span>
															<span className={"text-xs text-gray-500 mt-0.5"}>
																📅 {formatToDisplayDate(ev.date)} • {evClasses.length} klasser • {evStations.length} poster
															</span>
														</div>

														<span className={cn(
															"px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase",
															ev.status === "ACTIVE"
																? "bg-green-100 text-green-700"
																: ev.status === "READY"
																? "bg-blue-100 text-blue-700"
																: ev.status === "DONE"
																? "bg-gray-200 text-gray-600"
																: "bg-yellow-100 text-yellow-700"
														)}>
															{ev.status}
														</span>
													</Link>
												);
											})}
										</div>
									</div>

									{/* Quick Action Shortcuts */}
									<div className={cn(card(), "bg-white p-6 flex flex-col gap-4 shadow-sm")}>
										<h3 className={"text-lg font-bold text-gray-900 pb-2 border-b border-gray-100"}>
											Hurtige Handlinger
										</h3>

										<div className={"grid grid-cols-2 gap-3"}>
											<Link
												href={"/admin/events"}
												className={cn(button({ shape: "pill" }), "text-xs font-semibold justify-center hover:bg-hover hover:text-white")}
											>
												+ Begivenhed
											</Link>
											<Link
												href={"/admin/schools"}
												className={cn(button({ shape: "pill" }), "text-xs font-semibold justify-center hover:bg-hover hover:text-white")}
											>
												+ Skole
											</Link>
											<Link
												href={"/admin/classes"}
												className={cn(button({ shape: "pill" }), "text-xs font-semibold justify-center hover:bg-hover hover:text-white")}
											>
												+ Klasse
											</Link>
											<Link
												href={"/admin/teams"}
												className={cn(button({ shape: "pill" }), "text-xs font-semibold justify-center hover:bg-hover hover:text-white")}
											>
												+ Hold
											</Link>
											<Link
												href={"/admin/stations"}
												className={cn(button({ shape: "pill" }), "text-xs font-semibold justify-center hover:bg-hover hover:text-white")}
											>
												+ Station / Post
											</Link>
											<Link
												href={"/admin/accounts"}
												className={cn(button({ shape: "pill" }), "text-xs font-semibold justify-center hover:bg-hover hover:text-white")}
											>
												+ Brugerkonto
											</Link>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				/>
			</div>
		</AdminShell>
	);
}