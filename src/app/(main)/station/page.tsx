"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
	getEvents,
	getStations,
	getClasses,
	getTeams,
	getStationTimes,
	createStationTime,
	updateStationTime,
	deleteStationTime,
} from "@/libs/API";
import { getCurrentUser, getCachedUser, logoutUser, AuthUser } from "@/libs/auth";
import { StationModel, StationTimeModel } from "@/models/StationModel";
import { ClassModel } from "@/models/ClassModel";
import { TeamModel } from "@/models/TeamModel";
import { EventModel } from "@/models/EventModel";

const normalizeTime = (value: string) => {
	const trimmed = value.trim();
	if (!trimmed) return "";

	const hasColon = trimmed.includes(":");
	const numericValue = trimmed.replace(/[^\d:]/g, "");
	if (!numericValue) return "";

	let minutes = "0";
	let seconds = "0";

	if (hasColon) {
		const [left, right = "0"] = trimmed.split(":");
		minutes = left || "0";
		seconds = right || "0";
	} else {
		const digits = trimmed.replace(/\D/g, "");
		if (digits.length <= 2) {
			minutes = digits || "0";
		} else {
			minutes = digits.slice(0, 2);
			seconds = digits.slice(2, 4);
		}
	}

	const minuteValue = Number(minutes);
	const secondValue = Number(seconds);

	if (minuteValue > 59 || secondValue > 59) return "";

	return `${String(minuteValue).padStart(2, "0")}:${String(secondValue).padStart(2, "0")}`;
};

const timeToSeconds = (timeStr: string): number => {
	const [min, sec] = timeStr.split(":").map(Number);
	return (min || 0) * 60 + (sec || 0);
};

const secondsToTime = (sec: number): string => {
	const m = Math.floor(sec / 60);
	const s = sec % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export default function StationPage() {
	const cached = getCachedUser();
	const [user, setUser] = useState<AuthUser | null>(cached ?? null);
	const [authChecking, setAuthChecking] = useState<boolean>(cached === undefined);

	const [events, setEvents] = useState<EventModel[]>([]);
	const [stations, setStations] = useState<StationModel[]>([]);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [stationTimes, setStationTimes] = useState<StationTimeModel[]>([]);
	const [loading, setLoading] = useState(true);

	const [classIndex, setClassIndex] = useState<number>(0);
	const [draftTimes, setDraftTimes] = useState<Record<number, string>>({});

	// 1. Auth Guard
	useEffect(() => {
		getCurrentUser().then((u) => {
			const currentPath = window.location.pathname + window.location.search;
			if (!u) {
				window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
			} else if (u.type !== "POST_GUARD" && u.type !== "ORGANIZER") {
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

	// Active Station & Event
	const currentStation = useMemo(() => {
		if (!user) return null;
		if (user.stationId !== undefined) {
			return stations.find((s) => s.id === user.stationId) || null;
		}
		return stations[0] || null;
	}, [user, stations]);

	const currentEvent = useMemo(() => {
		if (!currentStation) {
			return events.find((e) => e.status === "RUNNING") || events[0] || null;
		}
		return events.find((e) => e.id === currentStation.eventId) || events[0] || null;
	}, [currentStation, events]);

	const eventClasses = useMemo(() => {
		if (!currentEvent) return [];
		return classes.filter((c) => c.eventId === currentEvent.id);
	}, [classes, currentEvent]);

	const selectedClass = useMemo(() => {
		if (eventClasses.length === 0) return null;
		const safeIndex = Math.min(classIndex, eventClasses.length - 1);
		return eventClasses[safeIndex >= 0 ? safeIndex : 0] || null;
	}, [eventClasses, classIndex]);

	const classTeams = useMemo(() => {
		if (!selectedClass) return [];
		return teams.filter((t) => t.classId === selectedClass.id);
	}, [teams, selectedClass]);

	const currentStationTimes = useMemo(() => {
		if (!currentStation) return [];
		return stationTimes.filter((st) => st.stationId === currentStation.id);
	}, [stationTimes, currentStation]);

	// Format teams for display
	const teamTimes = useMemo(() => {
		return classTeams.map((t) => {
			const timeRec = currentStationTimes.find((st) => st.teamId === t.id);
			return {
				id: t.id,
				name: t.name,
				time: timeRec ? secondsToTime(timeRec.timeSeconds) : "",
				resultId: timeRec?.id,
			};
		});
	}, [classTeams, currentStationTimes]);

	const completed = useMemo(() => {
		return teamTimes.filter((t) => t.time !== "");
	}, [teamTimes]);

	const bestTime = useMemo(() => {
		if (completed.length === 0) return null;
		return completed.reduce((best, current) => {
			return timeToSeconds(current.time) < timeToSeconds(best.time) ? current : best;
		}, completed[0]);
	}, [completed]);

	const updateTime = (id: number, time: string) => {
		setDraftTimes((current) => ({
			...current,
			[id]: time.slice(0, 5),
		}));
	};

	const saveTime = async (id: number) => {
		const draft = normalizeTime(draftTimes[id] ?? "");
		if (!draft || !currentStation || !currentEvent) return;

		const seconds = timeToSeconds(draft);
		try {
			const existing = currentStationTimes.find((st) => st.teamId === id);
			if (existing) {
				const updated = await updateStationTime(existing.id, {
					timeSeconds: seconds,
					completedAt: new Date().toISOString(),
				});
				setStationTimes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
			} else {
				const created = await createStationTime({
					stationId: currentStation.id,
					teamId: id,
					eventId: currentEvent.id,
					timeSeconds: seconds,
					completedAt: new Date().toISOString(),
				});
				setStationTimes((prev) => [...prev, created]);
			}

			setDraftTimes((current) => ({
				...current,
				[id]: "",
			}));
		} catch (err) {
			console.error("Fejl ved gemning af tid:", err);
		}
	};

	const deleteTime = async (id: number) => {
		const targetTime = currentStationTimes.find((st) => st.teamId === id);
		if (targetTime) {
			try {
				await deleteStationTime(targetTime.id);
				setStationTimes((prev) => prev.filter((t) => t.id !== targetTime.id));
			} catch (err) {
				console.error("Fejl ved sletning af tid:", err);
			}
		}

		setDraftTimes((current) => ({
			...current,
			[id]: "",
		}));
	};

	if (authChecking) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background text-primary">
			<div className="flex min-h-screen">
				{/* SIDEBAR */}
				<aside className="hidden w-62.5 shrink-0 border-r border-border bg-background-secondary p-4 md:flex md:flex-col">
					<div className="mb-8 flex items-center gap-3 px-3 py-3">
						<div>
							<div className="font-bold tracking-wide uppercase">
								{selectedClass?.school || currentEvent?.title || "SKILLS"}
							</div>
						</div>
					</div>
				</aside>

				{/* MAIN */}
				<main className="min-w-0 flex-1">
					{/* TOPBAR */}
					<header className="flex h-18.5 items-center justify-between border-b border-border bg-box-background/80 px-5 md:px-9">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light font-bold text-green-dark">
								{user?.username ? user.username.charAt(0).toUpperCase() : "P"}
							</div>
							<div className="hidden text-left sm:block">
								<div className="text-sm font-semibold">
									{currentStation?.name || "Værksted"}
								</div>
								<div className="text-xs text-secondary">{user?.username}</div>
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
									🔧
								</div>
								<div>
									<h1 className="text-3xl font-bold tracking-tight">
										{currentStation?.name || "Værksted"}
									</h1>
									<p className="mt-1 text-sm text-secondary">
										{currentStation?.description || "Registrer holdenes gennemførselstider"}
									</p>
								</div>
							</div>
						</div>

						{/* TOP CARDS */}
						<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
							<StatCard
								title="Klasse"
								value={selectedClass?.name || "Ikke tilgængelig"}
								description={selectedClass?.teacherName || selectedClass?.school || "Ingen lærer angivet"}
							/>
							<StatCard
								title="Hold"
								value={`${completed.length} / ${teamTimes.length}`}
								description="Tider registreret"
							/>
						</div>

						{/* MAIN GRID */}
						<div className="grid gap-6 xl:grid-cols-[1fr_320px]">
							{/* TEAMS */}
							<section className="overflow-hidden rounded-2xl border border-border bg-box-background">
								<div className="flex items-center justify-between border-b border-border px-6 py-5">
									<div>
										<h2 className="font-bold">Hold & tider</h2>
										<p className="mt-1 text-xs text-secondary">
											Registrer den tid hvert hold bruger på værkstedet
										</p>
									</div>
									<div className="rounded-lg bg-accent-blue-background px-3 py-2 text-xs font-bold uppercase">
										{currentStation?.name || "POST"}
									</div>
								</div>

								<div className="divide-y divide-border">
									{loading ? (
										<div className="p-6 text-center text-secondary">Henter data...</div>
									) : teamTimes.length === 0 ? (
										<div className="p-6 text-center text-secondary">
											Ingen hold fundet i denne klasse.
										</div>
									) : (
										teamTimes.map((team) => (
											<div
												key={team.id}
												className="flex flex-col gap-4 px-6 py-5 transition hover:bg-primary/60 sm:flex-row sm:items-center sm:justify-between"
											>
												{/* TEAM */}
												<div className="flex items-center gap-4">
													<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-id-nr-background text-sm font-bold text-id-nr">
														{team.id}
													</div>
													<div>
														<div className="font-semibold">{team.name}</div>
														<div className="mt-1 text-xs text-secondary">
															{team.time ? "Tid registreret" : "Ingen tid registreret"}
														</div>
													</div>
												</div>

												{/* TIME */}
												<div className="flex items-center gap-3">
													{team.time ? (
														<>
															<div
																className="rounded-xl border border-green-dark bg-success-background px-5 py-3 font-mono text-lg font-bold text-success cursor-pointer"
																onClick={() => updateTime(team.id, team.time)}
															>
																{team.time}
															</div>

															<button
																onClick={() => deleteTime(team.id)}
																className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-background text-danger transition hover:bg-danger hover:text-primary"
																title="Slet tid"
															>
																×
															</button>
														</>
													) : (
														<div className="flex items-center gap-2">
															<input
																type="text"
																placeholder="MM:SS"
																value={draftTimes[team.id] ?? ""}
																maxLength={5}
																onChange={(e) => updateTime(team.id, e.target.value)}
																onKeyDown={(e) => {
																	if (e.key === "Enter") saveTime(team.id);
																}}
																className="w-28 rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-lg text-primary outline-none transition placeholder:text-[#525977] focus:border-green"
															/>

															<button
																type="button"
																onClick={() => saveTime(team.id)}
																className="rounded-xl bg-green-light px-4 py-3 font-semibold text-green-dark transition hover:bg-hover-bg"
															>
																Gem
															</button>
														</div>
													)}
												</div>
											</div>
										))
									)}
								</div>
							</section>

							{/* RIGHT COLUMN */}
							<aside className="space-y-5">
								<div className="rounded-2xl border border-border bg-box-background p-6">
									<div className="mb-5 flex items-center justify-between">
										<div>
											<div className="text-xs font-semibold uppercase tracking-wider text-secondary">
												Klassens Bedste hold resultat
											</div>
											<div className="mt-1 text-lg font-bold">
												{currentStation?.name || "Post"}
											</div>
										</div>
										<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-background text-xl">
											🏆
										</div>
									</div>
									<div className="text-4xl font-black text-warning">
										{bestTime?.time || "--:--"}
									</div>
									<div className="mt-2 text-sm text-secondary">
										{bestTime?.name || "Ingen registreret endnu"}
									</div>
								</div>

								<div className="rounded-2xl border border-border bg-box-background p-6">
									<div className="mb-3 flex items-center gap-3">
										<h3 className="font-bold">Om posten</h3>
									</div>
									<p className="text-sm leading-6 text-secondary">
										{currentStation?.description ||
											"På værkstedet skal eleverne gennemføre opgaven hurtigst muligt. Registrer tiden efter hvert hold har afsluttet posten."}
									</p>
								</div>
							</aside>
						</div>

						{/* NAVIGATION */}
						{eventClasses.length > 1 && (
							<div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
								<button
									className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary disabled:opacity-40"
									disabled={classIndex <= 0}
									onClick={() => setClassIndex((i) => Math.max(0, i - 1))}
								>
									← Forrige klasse
								</button>
								<button
									className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary disabled:opacity-40"
									disabled={classIndex >= eventClasses.length - 1}
									onClick={() => setClassIndex((i) => Math.min(eventClasses.length - 1, i + 1))}
								>
									Næste klasse →
								</button>
							</div>
						)}
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
