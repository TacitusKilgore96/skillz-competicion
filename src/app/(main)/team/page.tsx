"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	IconLogout,
	IconTrophy,
	IconClock,
	IconLoader2,
	IconTool,
	IconUsers,
	IconSchool,
	IconCheck,
	IconX,
	IconChartBar,
} from "@tabler/icons-react";
import {
	getEvents,
	getStations,
	getClasses,
	getTeams,
	getStationTimes,
} from "@/libs/API";
import { getCurrentUser, logoutUser, AuthUser } from "@/libs/auth";
import { StationModel, StationTimeModel } from "@/models/StationModel";
import { ClassModel } from "@/models/ClassModel";
import { TeamModel } from "@/models/TeamModel";
import { EventModel } from "@/models/EventModel";

const formatDuration = (totalSeconds: number): string => {
	if (isNaN(totalSeconds) || totalSeconds <= 0) return "--:--";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function TeamPage() {
	const router = useRouter();

	const [user, setUser] = useState<AuthUser | null>(null);
	const [authChecking, setAuthChecking] = useState(true);

	const [events, setEvents] = useState<EventModel[]>([]);
	const [stations, setStations] = useState<StationModel[]>([]);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [stationTimes, setStationTimes] = useState<StationTimeModel[]>([]);
	const [loading, setLoading] = useState(true);

	// 1. Auth Guard
	useEffect(() => {
		getCurrentUser().then((u) => {
			const currentPath = window.location.pathname + window.location.search;
			if (!u) {
				window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
			} else if (u.type !== "TEAM" && u.type !== "ORGANIZER") {
				window.location.href = `/unauthorized?target=${encodeURIComponent(currentPath)}`;
			} else {
				setUser(u);
				setAuthChecking(false);
			}
		});
	}, []);

	// 2. Fetch Data
	const fetchData = async () => {
		try {
			setLoading(true);
			const [eventsData, stationsData, classesData, teamsData, timesData] = await Promise.all([
				getEvents(),
				getStations(),
				getClasses(),
				getTeams(),
				getStationTimes(),
			]);

			setEvents(eventsData);
			setStations(stationsData);
			setClasses(classesData);
			setTeams(teamsData);
			setStationTimes(timesData);
		} catch (err) {
			console.error("Fejl ved indlæsning af holddata:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchData();
		}
	}, [user]);

	const handleLogout = async () => {
		await logoutUser();
		window.location.href = "/login";
	};

	// Determine active team
	const activeTeam = useMemo(() => {
		if (!user) return null;
		if (user.teamId !== undefined) {
			return teams.find((t) => t.id === user.teamId) || teams[0] || null;
		}
		// If organizer, show first team or default
		return teams[0] || null;
	}, [user, teams]);

	// Active class & event
	const activeClass = useMemo(() => {
		if (!activeTeam) return null;
		return classes.find((c) => c.id === activeTeam.classId) || null;
	}, [activeTeam, classes]);

	const activeEvent = useMemo(() => {
		if (!activeTeam) return null;
		return events.find((e) => e.id === activeTeam.eventId) || null;
	}, [activeTeam, events]);

	// Stations for this event
	const eventStations = useMemo(() => {
		if (!activeTeam) return [];
		return stations.filter((s) => s.eventId === activeTeam.eventId);
	}, [activeTeam, stations]);

	// Station times for this team
	const teamStationTimes = useMemo(() => {
		if (!activeTeam) return [];
		return stationTimes.filter((st) => st.teamId === activeTeam.id);
	}, [activeTeam, stationTimes]);

	const teamTimeByStationMap = useMemo(() => {
		const map = new Map<number, StationTimeModel>();
		for (const st of teamStationTimes) {
			map.set(st.stationId, st);
		}
		return map;
	}, [teamStationTimes]);

	// Metrics calculations
	const visitedStationsCount = teamStationTimes.length;
	const totalSeconds = teamStationTimes.reduce((acc, st) => acc + st.timeSeconds, 0);
	const averageDurationSeconds =
		visitedStationsCount > 0 ? Math.round(totalSeconds / visitedStationsCount) : 0;
	const bestDurationSeconds =
		visitedStationsCount > 0
			? Math.min(...teamStationTimes.map((st) => st.timeSeconds))
			: 0;

	if (authChecking) {
		return (
			<div className="h-screen w-screen bg-background flex flex-col items-center justify-center text-primary gap-3">
				<IconLoader2 size={32} className="animate-spin text-primary/50" />
				<p className="text-xs text-secondary font-medium">Indlæser holddata...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-primary">
			<div className="flex min-h-screen">
				{/* MAIN */}
				<main className="min-w-0 flex-1">
					{/* TOPBAR */}
					<header className="flex h-18.5 items-center justify-between border-b border-border bg-box-background/80 px-5 md:px-9">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light font-bold text-green-dark">
								{activeTeam?.name?.charAt(0).toUpperCase() || "H"}
							</div>
							<div className="text-left">
								<div className="text-sm font-semibold">{activeTeam?.name || "Hold"}</div>
								<div className="text-xs text-secondary">
									{activeClass?.name} · {activeClass?.school}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-3">
							{user?.type === "ORGANIZER" && (
								<Link
									href="/admin"
									className="text-xs font-semibold text-accent-blue hover:underline mr-2"
								>
									Admin Kontrolcenter
								</Link>
							)}

							<button
								type="button"
								onClick={handleLogout}
								className="flex items-center gap-1.5 text-xs text-secondary hover:text-danger transition px-3 py-1.5 rounded-xl hover:bg-background"
							>
								<IconLogout size={15} />
								<span className="hidden sm:inline">Log ud</span>
							</button>
						</div>
					</header>

					{/* CONTENT */}
					<div className="mx-auto max-w-350 p-5 md:p-9">
						{/* HEADER */}
						<div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
							<div className="flex items-center gap-4">
								<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue-background text-2xl">
									📈
								</div>
								<div>
									<h1 className="text-3xl font-bold tracking-tight">
										{activeTeam?.name || "Hold"}
									</h1>
									<p className="mt-1 text-sm text-secondary">
										{activeEvent?.title || "Konkurrence"} · Overblik over jeres resultater
									</p>
								</div>
							</div>
						</div>

						{/* TOP CARDS */}
						<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<StatCard
								title="Jeres Samlede Tid"
								value={formatDuration(totalSeconds)}
								description="mm:ss"
							/>
							<StatCard
								title="Gennemsnit Pr. Post"
								value={formatDuration(averageDurationSeconds)}
								description="mm:ss"
							/>
							<StatCard
								title="Bedste Tid"
								value={visitedStationsCount > 0 ? formatDuration(bestDurationSeconds) : "--:--"}
								description="mm:ss"
							/>
						</div>

						{/* MAIN GRID */}
						<div className="grid gap-6 xl:grid-cols-[1fr_320px]">
							{/* STATIONS / RESULTS */}
							<section className="overflow-hidden rounded-2xl border border-border bg-box-background">
								<div className="flex items-center justify-between border-b border-border px-6 py-5">
									<div>
										<h2 className="font-bold">Jeres resultater</h2>
										<p className="mt-1 text-xs text-secondary">
											Her kan I se jeres tider på alle poster
										</p>
									</div>
									<div className="text-xs font-semibold text-secondary">
										{visitedStationsCount} / {eventStations.length} poster
									</div>
								</div>

								<div className="divide-y divide-border overflow-y-auto max-h-[500px]">
									{loading ? (
										<div className="p-8 text-center text-secondary">
											<IconLoader2 size={24} className="animate-spin mx-auto mb-2" />
											<span>Henter resultater...</span>
										</div>
									) : eventStations.length === 0 ? (
										<div className="p-8 text-center text-secondary">
											Ingen poster fundet for denne begivenhed.
										</div>
									) : (
										eventStations.map((station) => {
											const record = teamTimeByStationMap.get(station.id);
											const isVisited = !!record;

											return (
												<div
													key={station.id}
													className="flex flex-col gap-4 px-6 py-5 transition hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
												>
													{/* STATION */}
													<div className="flex items-center gap-4">
														<div className="min-w-8 text-left text-xl font-bold text-primary">
															#{station.id}
														</div>
														<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-id-nr-background text-sm font-bold text-id-nr">
															<IconTool size={20} />
														</div>
														<div>
															<div className="font-semibold text-primary">{station.name}</div>
															<div className="mt-1 text-xs text-secondary">
																{isVisited
																	? "Tid registreret på stationen"
																	: "Ikke gennemført endnu"}
															</div>
														</div>
													</div>

													{/* STATUS & TIME */}
													<div className="flex items-center gap-3">
														<div className="min-w-[72px] text-left font-mono text-base font-bold text-primary">
															{isVisited ? formatDuration(record.timeSeconds) : "--:--"}
														</div>

														<div
															className={
																isVisited
																	? "rounded-xl border border-green-dark bg-success-background px-4 py-2 text-xs font-semibold text-success flex items-center gap-1"
																	: "rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-secondary flex items-center gap-1"
															}
														>
															{isVisited ? (
																<>
																	<IconCheck size={14} />
																	<span>Gennemført</span>
																</>
															) : (
																<>
																	<IconX size={14} />
																	<span>Afventer</span>
																</>
															)}
														</div>
													</div>
												</div>
											);
										})
									)}
								</div>
							</section>

							{/* RIGHT COLUMN */}
							<aside className="space-y-5">
								{/* VISIT STATUS */}
								<div className="rounded-2xl border border-border bg-box-background p-6">
									<div className="mb-5 flex items-center justify-between">
										<div>
											<div className="text-xs font-semibold uppercase tracking-wider text-secondary">
												Besøgsstatus
											</div>
											<div className="mt-1 text-lg font-bold">Poster</div>
										</div>
										<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-dark text-xl">
											✅
										</div>
									</div>

									<div className="text-4xl font-black text-warning">
										{visitedStationsCount}
									</div>

									<div className="mt-2 text-sm text-secondary">
										{visitedStationsCount} / {eventStations.length} Poster er gennemført
									</div>
								</div>

								<div className="rounded-2xl border border-border bg-box-background p-6">
									<div className="mb-3 flex items-center gap-3">
										<h3 className="font-bold">Om jeres tider</h3>
									</div>
									<p className="text-sm leading-6 text-secondary">
										Postvagterne registrerer automatisk jeres tid, når I afslutter hver post.
										I kan følge jeres samlede tid og status her.
									</p>
								</div>
							</aside>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

function StatCard({
	title,
	value,
	description,
	highlight = false,
}: {
	title: string;
	value: string;
	description: string;
	highlight?: boolean;
}) {
	return (
		<div
			className={`rounded-2xl border border-border bg-box-background p-5 ${
				highlight ? "border-warning/30" : ""
			}`}
		>
			<div className="text-xs font-semibold uppercase tracking-wider text-secondary">
				{title}
			</div>
			<div
				className={`mt-2 text-2xl font-black ${
					highlight ? "text-warning" : "text-primary"
				}`}
			>
				{value}
			</div>
			<div className="mt-1 text-xs text-secondary">{description}</div>
		</div>
	);
}
