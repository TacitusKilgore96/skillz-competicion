"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
	getEvents,
	getStations,
	getClasses,
	getTeams,
	getStationTimes,
} from "@/libs/API";
import { getCurrentUser, getCachedUser, logoutUser, AuthUser } from "@/libs/auth";
import { StationModel, StationTimeModel } from "@/models/StationModel";
import { ClassModel } from "@/models/ClassModel";
import { TeamModel } from "@/models/TeamModel";
import { EventModel } from "@/models/EventModel";

const teamBadgeIcons: Record<number, string> = {
	1: "/images/mortar-pestle-solid-full.svg",
	2: "/images/camera-regular-full.svg",
	3: "/images/hammer-solid-full.svg",
	4: "/images/gear-solid-full.svg",
	5: "/images/briefcase-medical-solid-full.svg",
	6: "/images/laptop-solid-full.svg",
	7: "/images/pencil-solid-full.svg",
	8: "/images/people-group-solid-full.svg",
	9: "/images/leaf-solid-full.svg",
	10: "/images/lightbulb-solid-full.svg",
};

const formatDuration = (totalSeconds: number): string => {
	if (isNaN(totalSeconds) || totalSeconds <= 0) return "--:--";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function TeamPage() {
	const cached = getCachedUser();
	const [user, setUser] = useState<AuthUser | null>(cached ?? null);
	const [authChecking, setAuthChecking] = useState<boolean>(cached === undefined);

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
			const [eventsData, stationsData, classesData, teamsData, timesData] =
				await Promise.all([
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
			console.error("Fejl ved hentning af data:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchData();
			const interval = setInterval(fetchData, 4000);
			return () => clearInterval(interval);
		}
	}, [user]);

	const handleLogout = async () => {
		await logoutUser();
		window.location.href = "/login";
	};

	// Identify active team & event
	const currentTeam = useMemo(() => {
		if (!user) return null;
		if (user.teamId !== undefined) {
			return teams.find((t) => t.id === user.teamId) || null;
		}
		return teams[0] || null;
	}, [user, teams]);

	const currentClass = useMemo(() => {
		if (!currentTeam) return null;
		return classes.find((c) => c.id === currentTeam.classId) || null;
	}, [currentTeam, classes]);

	const currentEvent = useMemo(() => {
		if (!currentTeam) {
			return events.find((e) => e.status === "RUNNING") || events[0] || null;
		}
		return events.find((e) => e.id === currentTeam.eventId) || events[0] || null;
	}, [currentTeam, events]);

	const eventStations = useMemo(() => {
		if (!currentEvent) return [];
		return stations.filter((s) => s.eventId === currentEvent.id);
	}, [stations, currentEvent]);

	// Team recorded times
	const myTimes = useMemo(() => {
		if (!currentTeam) return [];
		return stationTimes.filter((st) => st.teamId === currentTeam.id);
	}, [stationTimes, currentTeam]);

	const totalSeconds = useMemo(() => {
		return myTimes.reduce((acc, t) => acc + t.timeSeconds, 0);
	}, [myTimes]);

	const averageSeconds = useMemo(() => {
		return myTimes.length > 0 ? Math.round(totalSeconds / myTimes.length) : 0;
	}, [myTimes, totalSeconds]);

	const bestDuration = useMemo(() => {
		if (myTimes.length === 0) return 0;
		return Math.min(...myTimes.map((t) => t.timeSeconds));
	}, [myTimes]);

	const visitedCount = myTimes.length;

	if (authChecking) {
		return null;
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
								{currentTeam?.name ? currentTeam.name.charAt(0).toUpperCase() : "H"}
							</div>
							<div className="hidden text-left sm:block">
								<div className="text-sm font-semibold">
									{currentTeam?.name || "Hold"}
								</div>
								<div className="text-xs text-secondary">
									{currentClass?.name ? `${currentClass.name} (${currentClass.school})` : user?.username}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={handleLogout}
								className="text-xs font-semibold text-secondary hover:text-danger px-3 py-1.5 rounded-lg transition"
							>
								Log ud
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
										{currentTeam?.name || "Hold"}
									</h1>
									<p className="mt-1 text-sm text-secondary">
										Overblik over jeres resultater
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
								value={formatDuration(averageSeconds)}
								description="mm:ss"
							/>
							<StatCard
								title="Bedste Tid"
								value={myTimes.length > 0 ? formatDuration(bestDuration) : "--:--"}
								description="mm:ss"
							/>
						</div>

						{/* MAIN GRID */}
						<div className="grid gap-6 xl:grid-cols-[1fr_320px]">
							{/* TEAMS / STATIONS */}
							<section className="overflow-hidden rounded-2xl border border-border bg-box-background">
								<div className="flex items-center justify-between border-b border-border px-6 py-5">
									<div>
										<h2 className="font-bold">Jeres resultater</h2>
										<p className="mt-1 text-xs text-secondary">
											Her kan I se jeres tider på alle poster
										</p>
									</div>
								</div>

								<div className="divide-y divide-border overflow-y-auto max-h-120">
									{loading ? (
										<div className="p-6 text-center text-secondary">Henter poster...</div>
									) : eventStations.length === 0 ? (
										<div className="p-6 text-center text-secondary">Ingen poster oprettet endnu.</div>
									) : (
										eventStations.map((station, index) => {
											const timeRecord = myTimes.find((st) => st.stationId === station.id);
											const isVisited = Boolean(timeRecord);
											const stationNumber = index + 1;
											const iconSrc = teamBadgeIcons[stationNumber] || teamBadgeIcons[(stationNumber % 10) + 1];

											return (
												<div
													key={station.id}
													className="flex flex-col gap-4 px-6 py-5 transition hover:bg-primary/10 sm:flex-row sm:items-center sm:justify-between"
												>
													{/* STATION */}
													<div className="flex items-center gap-4">
														<div className="min-w-8 text-left text-xl font-bold text-primary">
															{stationNumber}
														</div>

														<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-id-nr-background text-sm font-bold text-id-nr">
															{iconSrc ? (
																<img
																	src={iconSrc}
																	alt={`Post ${stationNumber}`}
																	className="h-7 w-7 object-contain"
																/>
															) : (
																stationNumber
															)}
														</div>

														<div>
															<div className="font-semibold">{station.name}</div>
															<div className="mt-1 text-xs text-secondary">
																{isVisited ? "Besøgt stationen" : "Har ikke besøgt stationen"}
															</div>
														</div>
													</div>

													{/* STATUS */}
													<div className="flex items-center gap-3">
														<div className="min-w-[72px] text-left font-mono text-base font-bold text-primary">
															{isVisited ? formatDuration(timeRecord?.timeSeconds || 0) : "--:--"}
														</div>

														<div
															className={
																isVisited
																	? "rounded-xl border border-green-dark bg-success-background px-4 py-2.5 text-sm font-semibold text-success"
																	: "rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-secondary"
															}
														>
															{isVisited ? "Besøgt" : "Ikke besøgt"}
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
												Besøgstatus
											</div>
											<div className="mt-1 text-lg font-bold">Poster</div>
										</div>
										<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-background text-success text-xl">
											✅
										</div>
									</div>

									<div className="text-4xl font-black text-warning">
										{visitedCount}
									</div>

									<div className="mt-2 text-sm text-secondary">
										{visitedCount} / {eventStations.length} Poster er besøgt
									</div>
								</div>

								<div className="rounded-2xl border border-border bg-box-background p-6">
									<div className="mb-3 flex items-center gap-3">
										<h3 className="font-bold">Om posten</h3>
									</div>
									<p className="text-sm leading-6 text-secondary">
										Her kan I følge jeres fremskridt. Stationernes vagter registrerer jeres tider så snart I gennemfører en opgave.
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
