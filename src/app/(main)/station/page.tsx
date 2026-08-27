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
	IconEdit,
	IconTrash,
} from "@tabler/icons-react";
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
import { getCurrentUser, logoutUser, AuthUser } from "@/libs/auth";
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
	const router = useRouter();

	const [user, setUser] = useState<AuthUser | null>(null);
	const [authChecking, setAuthChecking] = useState(true);

	const [events, setEvents] = useState<EventModel[]>([]);
	const [stations, setStations] = useState<StationModel[]>([]);
	const [activeStation, setActiveStation] = useState<StationModel | null>(null);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [classId, setClassId] = useState<number>(0);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [stationTimes, setStationTimes] = useState<StationTimeModel[]>([]);

	const [draftTimes, setDraftTimes] = useState<Record<number, string>>({});
	const [loading, setLoading] = useState(true);

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

	// 2. Fetch Data from local API
	const fetchData = async () => {
		try {
			setLoading(true);
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

			// Determine which station to display
			let currentStation: StationModel | null = null;
			if (user?.type === "POST_GUARD") {
				currentStation =
					stationsData.find(
						(s) => s.id === user.stationId || s.accountId === user.id
					) || stationsData[0] || null;
			} else {
				currentStation = stationsData[0] || null;
			}
			setActiveStation(currentStation);

			// Set initial class
			if (classesData.length > 0) {
				const relevantClasses = currentStation
					? classesData.filter((c) => c.eventId === currentStation.eventId)
					: classesData;
				if (relevantClasses.length > 0) {
					setClassId(relevantClasses[0].id);
				}
			}
		} catch (err) {
			console.error("Fejl ved hentning af postdata:", err);
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

	// Active class and event
	const eventClasses = useMemo(() => {
		if (!activeStation) return classes;
		return classes.filter((c) => c.eventId === activeStation.eventId);
	}, [activeStation, classes]);

	const classData = useMemo(() => {
		return classes.find((c) => c.id === classId) || eventClasses[0] || null;
	}, [classes, classId, eventClasses]);

	// Teams for current class and station's event
	const classTeams = useMemo(() => {
		if (!classData) return [];
		return teams.filter((t) => t.classId === classData.id);
	}, [classData, teams]);

	// Times mapped by teamId for active station
	const teamTimeMap = useMemo(() => {
		const map = new Map<number, StationTimeModel>();
		if (!activeStation) return map;
		for (const st of stationTimes) {
			if (st.stationId === activeStation.id) {
				map.set(st.teamId, st);
			}
		}
		return map;
	}, [activeStation, stationTimes]);

	const updateTimeDraft = (id: number, time: string) => {
		setDraftTimes((current) => ({
			...current,
			[id]: time.slice(0, 5),
		}));
	};

	// Save or update time
	const saveTime = async (teamId: number) => {
		if (!activeStation) return;
		const draft = normalizeTime(draftTimes[teamId] ?? "");
		if (!draft) return;

		const seconds = timeToSeconds(draft);
		try {
			const existing = teamTimeMap.get(teamId);
			if (existing) {
				const updated = await updateStationTime(existing.id, {
					timeSeconds: seconds,
					completedAt: new Date().toISOString(),
				});
				setStationTimes((prev) =>
					prev.map((item) => (item.id === updated.id ? updated : item))
				);
			} else {
				const created = await createStationTime({
					eventId: activeStation.eventId,
					stationId: activeStation.id,
					teamId: teamId,
					timeSeconds: seconds,
					completedAt: new Date().toISOString(),
				});
				setStationTimes((prev) => [...prev, created]);
			}

			setDraftTimes((current) => ({
				...current,
				[teamId]: "",
			}));
		} catch (err) {
			console.error("Fejl ved gemning af tid:", err);
		}
	};

	// Delete time
	const deleteTime = async (teamId: number) => {
		const targetRecord = teamTimeMap.get(teamId);
		if (!targetRecord) return;

		try {
			await deleteStationTime(targetRecord.id);
			setStationTimes((prev) => prev.filter((st) => st.id !== targetRecord.id));
			setDraftTimes((current) => ({
				...current,
				[teamId]: "",
			}));
		} catch (err) {
			console.error("Fejl ved sletning af tid:", err);
		}
	};

	// Calculated metrics
	const completedTeams = useMemo(() => {
		return classTeams.filter((team) => teamTimeMap.has(team.id));
	}, [classTeams, teamTimeMap]);

	const bestTeamRecord = useMemo(() => {
		if (!activeStation) return null;
		const relevantTimes = stationTimes.filter(
			(st) => st.stationId === activeStation.id
		);
		if (relevantTimes.length === 0) return null;

		let best = relevantTimes[0];
		for (const st of relevantTimes) {
			if (st.timeSeconds < best.timeSeconds) {
				best = st;
			}
		}

		const team = teams.find((t) => t.id === best.teamId);
		return {
			name: team ? team.name : `Hold #${best.teamId}`,
			time: secondsToTime(best.timeSeconds),
		};
	}, [activeStation, stationTimes, teams]);

	// Next / Previous Class
	const currentClassIndex = eventClasses.findIndex((c) => c.id === classData?.id);

	const handlePrevClass = () => {
		if (currentClassIndex > 0) {
			setClassId(eventClasses[currentClassIndex - 1].id);
		}
	};

	const handleNextClass = () => {
		if (currentClassIndex < eventClasses.length - 1) {
			setClassId(eventClasses[currentClassIndex + 1].id);
		}
	};

	if (authChecking) {
		return (
			<div className="h-screen w-screen bg-background flex flex-col items-center justify-center text-primary gap-3">
				<IconLoader2 size={32} className="animate-spin text-primary/50" />
				<p className="text-xs text-secondary font-medium">Verificerer postvagt adgang...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-primary">
			<div className="flex min-h-screen">
				{/* SIDEBAR */}
				<aside className="hidden w-62.5 shrink-0 border-r border-border bg-background-secondary p-4 md:flex md:flex-col justify-between">
					<div className="space-y-6">
						<div className="flex items-center gap-3 px-3 py-3">
							<div>
								<div className="font-bold tracking-wide uppercase">
									{classData?.school || "SKILLS"}
								</div>
								<div className="text-xs text-secondary">
									{activeStation?.name || "Postvagt"}
								</div>
							</div>
						</div>

						{/* Class list in sidebar */}
						<div className="space-y-1">
							<span className="text-[11px] font-semibold uppercase tracking-wider text-secondary px-3 block mb-2">
								Klasser
							</span>
							{eventClasses.map((c) => (
								<button
									key={c.id}
									type="button"
									onClick={() => setClassId(c.id)}
									className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition truncate flex items-center justify-between ${
										classData?.id === c.id
											? "bg-green text-white font-bold"
											: "text-secondary hover:bg-box-background hover:text-primary"
									}`}
								>
									<span className="truncate">{c.name}</span>
									<span className="text-[10px] opacity-75">{c.school}</span>
								</button>
							))}
						</div>
					</div>

					{/* Sidebar footer logout */}
					<div className="pt-4 border-t border-border">
						<button
							type="button"
							onClick={handleLogout}
							className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-secondary hover:text-danger rounded-xl hover:bg-box-background transition"
						>
							<IconLogout size={15} />
							<span>Log ud</span>
						</button>
					</div>
				</aside>

				{/* MAIN */}
				<main className="min-w-0 flex-1">
					{/* TOPBAR */}
					<header className="flex h-18.5 items-center justify-between border-b border-border bg-box-background/80 px-5 md:px-9">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-light font-bold text-green-dark">
								{user?.username?.charAt(0).toUpperCase() || "P"}
							</div>
							<div className="text-left">
								<div className="text-sm font-semibold">{activeStation?.name || "Post"}</div>
								<div className="text-xs text-secondary">{user?.username}</div>
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
									🔧
								</div>
								<div>
									<h1 className="text-3xl font-bold tracking-tight">
										{activeStation?.name || "Værksted"}
									</h1>
									<p className="mt-1 text-sm text-secondary">
										Registrer tider for holdene på denne post
									</p>
								</div>
							</div>
						</div>

						{/* TOP CARDS */}
						<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
							<StatCard
								title="Klasse"
								value={classData?.name || "Ingen klasse"}
								description={
									classData
										? `${classData.school}${
												classData.teacherName ? ` · Lærer: ${classData.teacherName}` : ""
										  }`
										: "Ikke tilgængelig"
								}
							/>
							<StatCard
								title="Hold"
								value={`${completedTeams.length} / ${classTeams.length}`}
								description="Tider registreret i denne klasse"
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
											Registrer den tid hvert hold bruger på posten
										</p>
									</div>
									<div className="rounded-lg bg-accent-blue-background px-3 py-2 text-xs font-semibold text-accent-blue">
										{activeStation?.name || "POST"}
									</div>
								</div>

								<div className="divide-y divide-border">
									{loading ? (
										<div className="p-8 text-center text-secondary">
											<IconLoader2 size={24} className="animate-spin mx-auto mb-2" />
											<span>Henter data...</span>
										</div>
									) : classTeams.length === 0 ? (
										<div className="p-8 text-center text-secondary">
											Ingen hold fundet for denne klasse.
										</div>
									) : (
										classTeams.map((team) => {
											const record = teamTimeMap.get(team.id);
											const hasTime = !!record;

											return (
												<div
													key={team.id}
													className="flex flex-col gap-4 px-6 py-5 transition hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
												>
													{/* TEAM */}
													<div className="flex items-center gap-4">
														<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-id-nr-background text-sm font-bold text-id-nr">
															{team.id}
														</div>
														<div>
															<div className="font-semibold">{team.name}</div>
															<div className="mt-1 text-xs text-secondary">
																{hasTime
																	? "Tid registreret"
																	: "Ingen tid registreret"}
															</div>
														</div>
													</div>

													{/* TIME */}
													<div className="flex items-center gap-3">
														{hasTime ? (
															<>
																<div
																	className="rounded-xl border border-green-dark bg-success-background px-5 py-3 font-mono text-lg font-bold text-success cursor-pointer"
																	onClick={() =>
																		updateTimeDraft(
																			team.id,
																			secondsToTime(record.timeSeconds)
																		)
																	}
																	title="Klik for at redigere"
																>
																	{secondsToTime(record.timeSeconds)}
																</div>

																<button
																	type="button"
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
																	onChange={(e) =>
																		updateTimeDraft(team.id, e.target.value)
																	}
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
											);
										})
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
												{activeStation?.name || "Post"}
											</div>
										</div>
										<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-background text-xl">
											🏆
										</div>
									</div>
									<div className="text-4xl font-black text-warning">
										{bestTeamRecord?.time || "--:--"}
									</div>
									<div className="mt-2 text-sm text-secondary">
										{bestTeamRecord?.name || "Ingen registreret endnu"}
									</div>
								</div>

								<div className="rounded-2xl border border-border bg-box-background p-6">
									<div className="mb-3 flex items-center gap-3">
										<h3 className="font-bold">Om posten</h3>
									</div>
									<p className="text-sm leading-6 text-secondary">
										{activeStation?.description ||
											"På værkstedet skal eleverne gennemføre opgaven hurtigst muligt. Registrer tiden efter hvert hold har afsluttet posten."}
									</p>
								</div>
							</aside>
						</div>

						{/* NAVIGATION */}
						{eventClasses.length > 1 && (
							<div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
								<button
									type="button"
									disabled={currentClassIndex <= 0}
									onClick={handlePrevClass}
									className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-secondary"
								>
									← Forrige klasse
								</button>
								<button
									type="button"
									disabled={currentClassIndex >= eventClasses.length - 1}
									onClick={handleNextClass}
									className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary disabled:opacity-40 disabled:hover:border-border disabled:hover:text-secondary"
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
