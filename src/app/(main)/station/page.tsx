"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import {
	IconUsers,
	IconSearch,
	IconCheck,
	IconClock,
	IconMenu2,
	IconX,
	IconChevronRight,
	IconTrophy,
	IconFilter,
} from "@tabler/icons-react";

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

// Konvertering mellem MM:SS og sekunder
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
	const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
	const [teamSearch, setTeamSearch] = useState<string>("");
	const [sidebarClassFilter, setSidebarClassFilter] = useState<string>("ALL");
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

	const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

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

	const currentStationTimes = useMemo(() => {
		if (!currentStation) return [];
		return stationTimes.filter((st) => st.stationId === currentStation.id);
	}, [stationTimes, currentStation]);

	// All teams in current event with extra meta (class, school, time)
	const allEventTeamsWithStatus = useMemo(() => {
		if (!currentEvent) return [];
		const classMap = new Map(eventClasses.map((c) => [c.id, c]));

		return teams
			.filter((t) => t.eventId === currentEvent.id)
			.map((t) => {
				const cls = classMap.get(t.classId);
				const timeRec = currentStationTimes.find((st) => st.teamId === t.id);
				return {
					...t,
					className: cls?.name || "Ukendt klasse",
					schoolName: cls?.school || "",
					time: timeRec ? secondsToTime(timeRec.timeSeconds) : "",
					timeSeconds: timeRec?.timeSeconds ?? null,
					resultId: timeRec?.id,
					isCompleted: Boolean(timeRec),
				};
			});
	}, [teams, currentEvent, eventClasses, currentStationTimes]);

	// Filtered sidebar teams based on search & class filter
	const sidebarTeams = useMemo(() => {
		let list = allEventTeamsWithStatus;

		if (sidebarClassFilter !== "ALL") {
			const classIdNum = Number(sidebarClassFilter);
			list = list.filter((t) => t.classId === classIdNum);
		}

		if (teamSearch.trim()) {
			const q = teamSearch.toLowerCase().trim();
			list = list.filter(
				(t) =>
					t.name.toLowerCase().includes(q) ||
					t.className.toLowerCase().includes(q) ||
					t.schoolName.toLowerCase().includes(q) ||
					String(t.id).includes(q)
			);
		}

		return list;
	}, [allEventTeamsWithStatus, sidebarClassFilter, teamSearch]);

	// Teams in active class for main area
	const classTeams = useMemo(() => {
		if (!selectedClass) return [];
		return teams.filter((t) => t.classId === selectedClass.id);
	}, [teams, selectedClass]);

	// Format teams for display in main section
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

	// 3. POST: Gem tid til API
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

	// 4. DELETE: Fjern tid
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

	// Switch active team from sidebar
	const handleSelectTeam = (team: typeof allEventTeamsWithStatus[0]) => {
		setSelectedTeamId(team.id);

		// If team is in a different class, switch classIndex to match that class
		const targetClassIndex = eventClasses.findIndex((c) => c.id === team.classId);
		if (targetClassIndex !== -1 && targetClassIndex !== classIndex) {
			setClassIndex(targetClassIndex);
		}

		// Scroll to team card in main view
		setTimeout(() => {
			const el = document.getElementById(`team-card-${team.id}`);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			}
			const inputEl = inputRefs.current[team.id];
			if (inputEl) {
				inputEl.focus();
			}
		}, 100);

		// Close mobile drawer if on mobile screen
		if (window.innerWidth < 768) {
			setSidebarOpen(false);
		}
	};

	if (authChecking) {
		return null;
	}

	return (
		<div className="min-h-screen bg-background text-primary">
			<div className="flex min-h-screen">
				{/* MOBILE SIDEBAR OVERLAY */}
				{sidebarOpen && (
					<div
						className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}

				{/* SIDEBAR */}
				<aside
					className={`fixed inset-y-0 left-0 z-50 flex w-76 shrink-0 flex-col border-r border-border bg-box-background transition-transform duration-300 md:static md:w-80 md:translate-x-0 ${
						sidebarOpen ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					{/* SIDEBAR HEADER */}
					<div className="flex items-center justify-between border-b border-border p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue-background text-accent-blue">
								<IconUsers size={20} />
							</div>
							<div>
								<div className="text-xs font-bold tracking-wider text-secondary uppercase">
									Holdoversigt
								</div>
								<div className="text-sm font-bold text-primary truncate max-w-44">
									{currentStation?.name || "Værksted"}
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={() => setSidebarOpen(false)}
							className="rounded-lg p-1.5 text-secondary hover:bg-background-secondary hover:text-primary md:hidden"
						>
							<IconX size={20} />
						</button>
					</div>

					{/* SIDEBAR FILTERS & SEARCH */}
					<div className="space-y-2.5 border-b border-border p-3.5 bg-background/50">
						{/* Search Input */}
						<div className="relative">
							<IconSearch
								size={16}
								className="absolute top-1/2 left-3 -translate-y-1/2 text-secondary pointer-events-none"
							/>
							<input
								type="text"
								placeholder="Søg hold, klasse, id..."
								value={teamSearch}
								onChange={(e) => setTeamSearch(e.target.value)}
								className="w-full rounded-xl border border-border bg-background py-2 pr-3 pl-9 text-xs text-primary placeholder:text-secondary focus:border-accent-blue focus:outline-none"
							/>
							{teamSearch && (
								<button
									onClick={() => setTeamSearch("")}
									className="absolute top-1/2 right-2.5 -translate-y-1/2 text-secondary hover:text-primary"
								>
									<IconX size={14} />
								</button>
							)}
						</div>

						{/* Class Filter Dropdown */}
						{eventClasses.length > 1 && (
							<div className="relative">
								<select
									value={sidebarClassFilter}
									onChange={(e) => setSidebarClassFilter(e.target.value)}
									className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-primary focus:border-accent-blue focus:outline-none cursor-pointer"
								>
									<option value="ALL">Alle klasser ({allEventTeamsWithStatus.length} hold)</option>
									{eventClasses.map((c) => {
										const count = allEventTeamsWithStatus.filter((t) => t.classId === c.id).length;
										return (
											<option key={c.id} value={c.id}>
												{c.name} - {c.school} ({count} hold)
											</option>
										);
									})}
								</select>
								<div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-secondary">
									<IconFilter size={14} />
								</div>
							</div>
						)}
					</div>

					{/* SIDEBAR TEAM LIST */}
					<div className="flex-1 overflow-y-auto p-2 space-y-1.5">
						{loading ? (
							<div className="p-6 text-center text-xs text-secondary">Henter hold...</div>
						) : sidebarTeams.length === 0 ? (
							<div className="p-6 text-center text-xs text-secondary">
								Ingen hold matcher søgningen
							</div>
						) : (
							sidebarTeams.map((team) => {
								const isSelected = selectedTeamId === team.id;
								return (
									<button
										key={team.id}
										type="button"
										onClick={() => handleSelectTeam(team)}
										className={`group flex w-full items-center justify-between gap-2.5 rounded-xl border p-2.5 text-left transition ${
											isSelected
												? "border-accent-blue bg-accent-blue-background/70 shadow-sm"
												: "border-transparent bg-background-secondary/60 hover:border-border hover:bg-background-secondary"
										}`}
									>
										<div className="flex items-center gap-2.5 min-w-0">
											<div
												className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
													isSelected
														? "bg-accent-blue text-white"
														: team.isCompleted
														? "bg-success-background text-success border border-green-dark"
														: "bg-id-nr-background text-id-nr"
												}`}
											>
												{team.isCompleted ? <IconCheck size={14} /> : team.id}
											</div>

											<div className="min-w-0">
												<div
													className={`truncate text-xs font-semibold ${
														isSelected ? "text-primary font-bold" : "text-primary"
													}`}
												>
													{team.name}
												</div>
												<div className="truncate text-[11px] text-secondary">
													{team.className}
													{team.schoolName ? ` • ${team.schoolName}` : ""}
												</div>
											</div>
										</div>

										<div className="flex items-center gap-1 shrink-0">
											{team.isCompleted ? (
												<span className="rounded-md border border-green-dark/60 bg-success-background px-2 py-0.5 font-mono text-[11px] font-bold text-success">
													{team.time}
												</span>
											) : (
												<span className="rounded-md border border-border bg-background/80 px-2 py-0.5 font-mono text-[11px] text-secondary">
													--:--
												</span>
											)}
											<IconChevronRight
												size={14}
												className={`transition ${
													isSelected
														? "text-accent-blue translate-x-0.5"
														: "text-secondary/40 group-hover:text-secondary group-hover:translate-x-0.5"
												}`}
											/>
										</div>
									</button>
								);
							})
						)}
					</div>

					{/* SIDEBAR FOOTER STATS */}
					<div className="border-t border-border p-3.5 bg-background/40">
						<div className="flex items-center justify-between text-xs text-secondary">
							<span>Status for station:</span>
							<span className="font-semibold text-primary">
								{allEventTeamsWithStatus.filter((t) => t.isCompleted).length} / {allEventTeamsWithStatus.length} hold
							</span>
						</div>
						<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
							<div
								className="h-full bg-success transition-all duration-300"
								style={{
									width: `${
										allEventTeamsWithStatus.length > 0
											? Math.round(
													(allEventTeamsWithStatus.filter((t) => t.isCompleted).length /
														allEventTeamsWithStatus.length) *
														100
											  )
											: 0
									}%`,
								}}
							/>
						</div>
					</div>
				</aside>

				{/* MAIN */}
				<main className="min-w-0 flex-1">
					{/* TOPBAR */}
					<header className="flex h-18.5 items-center justify-between border-b border-border bg-box-background/80 px-5 md:px-9">
						<div className="flex items-center gap-3">
							{/* Mobile Sidebar Toggle Button */}
							<button
								type="button"
								onClick={() => setSidebarOpen(true)}
								className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background-secondary text-primary transition hover:border-accent-blue md:hidden"
								title="Åbn holdliste"
							>
								<IconMenu2 size={20} />
							</button>

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
								description="Tider registreret i klassen"
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
									<div className="rounded-lg bg-accent-blue-background px-3 py-2 text-xs font-bold uppercase text-accent-blue">
										{selectedClass?.name || currentStation?.name || "POST"}
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
										teamTimes.map((team) => {
											const isSelected = selectedTeamId === team.id;
											return (
												<div
													key={team.id}
													id={`team-card-${team.id}`}
													className={`flex flex-col gap-4 px-6 py-5 transition sm:flex-row sm:items-center sm:justify-between ${
														isSelected
															? "bg-accent-blue-background/30 ring-2 ring-accent-blue/60"
															: "hover:bg-primary/5"
													}`}
												>
													{/* TEAM */}
													<div className="flex items-center gap-4">
														<div
															className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${
																isSelected
																	? "bg-accent-blue text-white shadow-sm"
																	: "bg-id-nr-background text-id-nr"
															}`}
														>
															{team.id}
														</div>
														<div>
															<div className="flex items-center gap-2">
																<div className="font-semibold">{team.name}</div>
																{isSelected && (
																	<span className="rounded-md bg-accent-blue-background px-2 py-0.5 text-[10px] font-bold text-accent-blue uppercase tracking-wide">
																		Valgt hold
																	</span>
																)}
															</div>
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
																	className="rounded-xl border border-green-dark bg-success-background px-5 py-3 font-mono text-lg font-bold text-success cursor-pointer transition hover:scale-102"
																	onClick={() => updateTime(team.id, team.time)}
																	title="Klik for at redigere"
																>
																	{team.time}
																</div>

																<button
																	onClick={() => deleteTime(team.id)}
																	className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-background text-danger transition hover:bg-danger hover:text-primary cursor-pointer"
																	title="Slet tid"
																>
																	×
																</button>
															</>
														) : (
															<div className="flex items-center gap-2">
																<input
																	ref={(el) => {
																		inputRefs.current[team.id] = el;
																	}}
																	type="text"
																	placeholder="MM:SS"
																	value={draftTimes[team.id] ?? ""}
																	maxLength={5}
																	onChange={(e) => updateTime(team.id, e.target.value)}
																	onKeyDown={(e) => {
																		if (e.key === "Enter") saveTime(team.id);
																	}}
																	className={`w-28 rounded-xl border bg-background px-4 py-3 text-center font-mono text-lg text-primary outline-none transition placeholder:text-secondary/50 ${
																		isSelected
																			? "border-accent-blue ring-2 ring-accent-blue/30 focus:border-accent-blue"
																			: "border-border focus:border-green"
																	}`}
																/>

																<button
																	type="button"
																	onClick={() => saveTime(team.id)}
																	className="rounded-xl bg-green-light px-4 py-3 font-semibold text-green-dark transition hover:bg-hover-bg cursor-pointer"
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
												Klassens Bedste resultat
											</div>
											<div className="mt-1 text-lg font-bold">
												{currentStation?.name || "Post"}
											</div>
										</div>
										<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-background text-warning text-xl">
											<IconTrophy size={22} />
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
									className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary disabled:opacity-40 cursor-pointer"
									disabled={classIndex <= 0}
									onClick={() => {
										setClassIndex((i) => Math.max(0, i - 1));
										setSelectedTeamId(null);
									}}
								>
									← Forrige klasse
								</button>
								<button
									className="rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary disabled:opacity-40 cursor-pointer"
									disabled={classIndex >= eventClasses.length - 1}
									onClick={() => {
										setClassIndex((i) => Math.min(eventClasses.length - 1, i + 1));
										setSelectedTeamId(null);
									}}
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
