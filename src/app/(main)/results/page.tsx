"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	getEvents,
	getClasses,
	getTeams,
	getStations,
	getStationTimes,
} from "@/libs/API";
import { EventModel } from "@/models/EventModel";
import { ClassModel } from "@/models/ClassModel";
import { TeamModel } from "@/models/TeamModel";
import { StationModel, StationTimeModel } from "@/models/StationModel";
import {
	calculateLeaderboard,
	computeEventTiming,
	TeamStanding,
	EventTimingState,
} from "@/libs/leaderboard";

type Result = {
	id: number;
	school: string;
	klasse: string;
	hold: string;
	totalSeconds: number;
	visitedStations: number;
	totalPoints: number;
	rankChange?: number;
};

const topThreeStyles: Record<
	number,
	{
		background: string;
		text: string;
		secondaryText: string;
		number: string;
		emoji: string;
	}
> = {
	1: {
		background:
			"bg-gradient-to-r from-[#ffd86e] via-[#f59e0b] to-[#b45309] animate-bounce [animation-duration:2s]",
		text: "text-yellow-950 text-3xl",
		secondaryText: "text-black",
		number: "text-yellow-950",
		emoji: "🏆",
	},
	2: {
		background: "bg-gradient-to-tr from-slate-400 via-white to-slate-200",
		text: "text-slate-900",
		secondaryText: "text-black",
		number: "text-slate-900",
		emoji: "🥈",
	},
	3: {
		background: "bg-gradient-to-r from-[#F3C68F] via-[#CD7F31] to-[#8C4A11]",
		text: "text-orange-950",
		secondaryText: "text-black",
		number: "text-orange-950",
		emoji: "🥉",
	},
};

function formatDuration(totalSeconds: number) {
	if (isNaN(totalSeconds) || totalSeconds < 0) return "--:--";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ResultsPage() {
	const [events, setEvents] = useState<EventModel[]>([]);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [stations, setStations] = useState<StationModel[]>([]);
	const [stationTimes, setStationTimes] = useState<StationTimeModel[]>([]);
	const [tick, setTick] = useState<number>(0);

	const previousRanksRef = useRef<Map<number, number>>(new Map());

	const fetchData = async () => {
		try {
			const [eventsData, classesData, teamsData, stationsData, timesData] =
				await Promise.all([
					getEvents(),
					getClasses(),
					getTeams(),
					getStations(),
					getStationTimes(),
				]);
			setEvents(eventsData);
			setClasses(classesData);
			setTeams(teamsData);
			setStations(stationsData);
			setStationTimes(timesData);
		} catch (err) {
			console.error("Fejl ved synkronisering af resultater:", err);
		}
	};

	// 1. Initial fetch & Realtime SSE Stream connection
	useEffect(() => {
		fetchData();

		let eventSource: EventSource | null = null;
		try {
			eventSource = new EventSource("/api/events/live");
			eventSource.onmessage = () => {
				fetchData();
			};
		} catch (e) {
			console.warn("EventSource unavailable:", e);
		}

		// Fallback polling
		const interval = setInterval(fetchData, 4000);

		return () => {
			if (eventSource) eventSource.close();
			clearInterval(interval);
		};
	}, []);

	// 2. High-precision 1-second countdown ticker
	useEffect(() => {
		const ticker = setInterval(() => {
			setTick((t) => t + 1);
		}, 1000);
		return () => clearInterval(ticker);
	}, []);

	// Active event
	const activeEvent = useMemo(() => {
		if (events.length === 0) return null;
		const running = events.find((e) => e.status === "RUNNING");
		if (running) return running;
		const finished = events.find((e) => e.status === "FINISHED");
		if (finished) return finished;
		return events[0];
	}, [events]);

	const eventClasses = useMemo(() => {
		if (!activeEvent) return [];
		return classes.filter((c) => c.eventId === activeEvent.id);
	}, [classes, activeEvent]);

	const eventTeams = useMemo(() => {
		if (!activeEvent) return [];
		return teams.filter((t) => t.eventId === activeEvent.id);
	}, [teams, activeEvent]);

	const eventStations = useMemo(() => {
		if (!activeEvent) return [];
		return stations.filter((s) => s.eventId === activeEvent.id);
	}, [stations, activeEvent]);

	const eventTimes = useMemo(() => {
		if (!activeEvent) return [];
		return stationTimes.filter((t) => t.eventId === activeEvent.id);
	}, [stationTimes, activeEvent]);

	// Timing recalculated continuously on every tick
	const timing: EventTimingState = useMemo(() => {
		return computeEventTiming(activeEvent);
	}, [activeEvent, tick]);

	// Standings with dynamic rank delta tracking
	const standings: TeamStanding[] = useMemo(() => {
		if (eventTeams.length === 0) return [];
		const result = calculateLeaderboard(
			eventTeams,
			eventClasses,
			eventStations,
			eventTimes,
			previousRanksRef.current
		);

		const newRanksMap = new Map<number, number>();
		result.forEach((item) => newRanksMap.set(item.id, item.rank));
		previousRanksRef.current = newRanksMap;

		return result;
	}, [eventTeams, eventClasses, eventStations, eventTimes]);

	const resultsList: Result[] = useMemo(() => {
		return standings.map((item) => ({
			id: item.rank,
			school: item.schoolName || "–",
			klasse: item.className || "–",
			hold: item.teamName,
			totalSeconds: item.totalSeconds,
			visitedStations: item.completedStations,
			totalPoints: item.totalPoints,
			rankChange: item.rankChange,
		}));
	}, [standings]);

	// ==========================================
	// 1. INACTIVE STATE: Waiting for event start
	// ==========================================
	if (timing.phase === "INACTIVE" || !activeEvent || activeEvent.status === "CREATED") {
		return (
			<main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9 flex flex-col justify-center items-center">
				<div className="mx-auto max-w-4xl text-center space-y-8">
					<h1 className="uppercase text-5xl sm:text-6xl font-extrabold tracking-tight">
						🏆 Skills Konkurrence 🏆
					</h1>
					<div className="rounded-3xl border border-border bg-box-background p-12 max-w-xl mx-auto space-y-5 shadow-2xl">
						<div className="text-5xl">⏳</div>
						<h2 className="text-3xl font-black text-primary">Venter på startsignal</h2>
						<p className="text-base sm:text-lg text-secondary leading-relaxed">
							Konkurrencen for <span className="text-primary font-bold">{activeEvent?.title || "begivenheden"}</span> er ikke startet endnu.
							Stillingen opdateres automatisk i realtid så snart starten går.
						</p>
					</div>
				</div>
			</main>
		);
	}

	// ==========================================
	// 2. SUSPENSE BLACKOUT: Last 30 min
	// ==========================================
	if (timing.phase === "RUNNING_SUSPENSE") {
		return (
			<main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9 flex flex-col justify-center items-center">
				<div className="mx-auto max-w-4xl text-center space-y-8">
					<h1 className="uppercase text-5xl sm:text-6xl font-extrabold tracking-tight text-warning">
						🔥 Spændingen Stiger! 🔥
					</h1>
					<div className="rounded-3xl border border-border bg-box-background p-12 max-w-2xl mx-auto space-y-8 shadow-2xl">
						<div className="text-6xl animate-bounce [animation-duration:2s]">👀</div>
						<div className="space-y-3">
							<h2 className="text-4xl font-black text-primary">Stillingen er hemmelig</h2>
							<p className="text-base sm:text-lg text-secondary leading-relaxed">
								Leaderboardet er skjult i finalefasen for at bevare spændingen til den store præmieoverrækkelse!
							</p>
						</div>

						<div className="p-8 rounded-2xl bg-background border border-border">
							<div className="text-sm uppercase font-bold tracking-wider text-secondary mb-2">
								Resterende Konkurrencetid
							</div>
							<div className="text-7xl sm:text-8xl font-black font-mono text-warning tracking-tight">
								{timing.formattedRemaining}
							</div>
						</div>
					</div>
				</div>
			</main>
		);
	}

	// ==========================================
	// 3. PENDING VERIFICATION: Time is over
	// ==========================================
	if (timing.phase === "TIME_OVER_PENDING") {
		return (
			<main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9 flex flex-col justify-center items-center">
				<div className="mx-auto max-w-4xl text-center space-y-8">
					<h1 className="uppercase text-5xl sm:text-6xl font-extrabold tracking-tight">
						⏰ Tiden er Udløbet! ⏰
					</h1>
					<div className="rounded-3xl border border-border bg-box-background p-12 max-w-xl mx-auto space-y-6 shadow-2xl">
						<div className="text-5xl">🎯</div>
						<h2 className="text-3xl font-black text-primary">Gør klar til resultaterne</h2>
						<p className="text-base sm:text-lg text-secondary leading-relaxed">
							Tidsregistreringen er afsluttet. Det officielle vinderpodie offentliggøres lige om et øjeblik!
						</p>
					</div>
				</div>
			</main>
		);
	}

	// ==========================================
	// 4. FINAL RESULTS SCREEN: Original podium design (Display only)
	// ==========================================
	if (timing.phase === "FINAL_RESULTS") {
		return (
			<main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9 select-none">
				<div className="mx-auto max-w-350">
					<div className="mb-6">
						<h1 className="uppercase text-5xl font-extrabold text-center p-5 mb-10">
							🏆 Dagens Vindere 🏆
						</h1>

						<div className="flex items-center justify-center gap-6 mb-15 not-only:">
							<ResultTable
								results={resultsList.slice(0, 3)}
								showAverage={false}
								rowStyles={topThreeStyles}
							/>
							<img src="/images/victoryroyale.gif" alt="" className="w-70 hidden md:block" />
						</div>

						<h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
							Top 10 - Samlet Resultater
						</h1>
					</div>

					<section className="overflow-hidden rounded-2xl border border-border bg-box-background">
						<div className="overflow-x-none">
							{resultsList.length === 0 ? (
								<div className="p-12 text-center text-sm text-secondary">
									Ingen resultater registreret endnu.
								</div>
							) : (
								<div className={`grid gap-px bg-border ${resultsList.length > 5 ? "md:grid-cols-2" : "grid-cols-1"}`}>
									<ResultTable results={resultsList.slice(0, 5)} />
									{resultsList.length > 5 && (
										<ResultTable results={resultsList.slice(5, 10)} />
									)}
								</div>
							)}
						</div>
					</section>
				</div>
			</main>
		);
	}

	// ==========================================
	// 5. LIVE LEADERBOARD SCREEN: Display only, no hover states
	// ==========================================
	return (
		<main className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 py-8 text-primary flex flex-col font-sans select-none">
			<div className="mx-auto max-w-6xl w-full flex-1 flex flex-col space-y-8">
				{/* Top Hero: Big Timer & Event Header */}
				<header className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl border border-border bg-box-background shadow-xl">
					<div>
						<div className="text-sm font-bold uppercase tracking-wider text-secondary">
							Live Leaderboard
						</div>
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight mt-1">
							{activeEvent?.title || "Skills Konkurrence"}
						</h1>
					</div>

					{/* Big High-Visibility Countdown Timer */}
					<div className="flex items-center gap-6 bg-background border border-border px-8 py-4 rounded-2xl shadow-inner">
						<div className="text-right">
							<div className="text-xs uppercase font-extrabold tracking-wider text-secondary">
								Tid Tilbage
							</div>
							<div className="text-5xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight text-warning leading-none mt-1">
								{timing.formattedRemaining}
							</div>
						</div>
					</div>
				</header>

				{/* Single Unified High-Readability Leaderboard List */}
				<section className="flex-1 overflow-hidden rounded-3xl border border-border bg-box-background shadow-xl">
					{/* Table Header with large clear labels */}
					<div className="grid grid-cols-[70px_1fr_140px_130px] sm:grid-cols-[80px_1.6fr_1.1fr_130px_150px] items-center gap-4 px-6 sm:px-8 py-5 border-b border-border text-sm sm:text-base font-extrabold uppercase tracking-wider text-secondary">
						<div className="text-center">#</div>
						<div>Hold & Skole</div>
						<div className="hidden sm:block">Klasse</div>
						<div className="text-right">Poster</div>
						<div className="text-right">Point</div>
					</div>

					{/* Animated High-Contrast Rows (Display only, no hover states) */}
					<div className="divide-y divide-border">
						<AnimatePresence initial={false}>
							{standings.length === 0 ? (
								<div className="p-16 text-center text-lg sm:text-xl font-medium text-secondary">
									Venter på registrering af de første posttider...
								</div>
							) : (
								standings.map((team) => {
									const isTop1 = team.rank === 1;
									const isTop2 = team.rank === 2;
									const isTop3 = team.rank === 3;

									return (
										<motion.div
											key={team.id}
											layout
											initial={{ opacity: 0, y: 15 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{
												type: "spring",
												stiffness: 350,
												damping: 28,
											}}
											className={`grid grid-cols-[70px_1fr_140px_130px] sm:grid-cols-[80px_1.6fr_1.1fr_130px_150px] items-center gap-4 px-6 sm:px-8 py-5 ${
												isTop1
													? "bg-amber-500/15"
													: isTop2
														? "bg-slate-500/10"
														: isTop3
															? "bg-orange-500/10"
															: ""
											}`}
										>
											{/* Big Rank Badge + Rank Change Delta */}
											<div className="flex items-center justify-center gap-2">
												<div
													className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-sm ${
														isTop1
															? "bg-amber-500 text-black shadow-amber-500/30"
															: isTop2
																? "bg-slate-300 text-slate-900"
																: isTop3
																	? "bg-amber-700 text-white"
																	: "bg-id-nr-background text-id-nr"
													}`}
												>
													{team.rank}
												</div>

												{/* Rank Delta (▲ / ▼) */}
												{team.rankChange !== undefined && team.rankChange !== 0 && (
													<span
														className={`text-sm sm:text-base font-black ${
															team.rankChange > 0 ? "text-emerald-400" : "text-rose-400"
														}`}
													>
														{team.rankChange > 0 ? `▲` : `▼`}
													</span>
												)}
											</div>

											{/* Large Bold Team Name & School */}
											<div className="min-w-0 pr-2">
												<div className="font-extrabold text-xl sm:text-2xl text-primary truncate flex items-center gap-2.5">
													<span>{team.teamName}</span>
													{isTop1 && <span className="text-xl">👑</span>}
												</div>
												<div className="text-sm sm:text-base text-secondary font-medium truncate mt-0.5">
													{team.schoolName || "Ukendt skole"}
												</div>
											</div>

											{/* Class Name */}
											<div className="hidden sm:block text-base sm:text-lg text-secondary font-semibold truncate">
												{team.className || "–"}
											</div>

											{/* Completed Stations Badge */}
											<div className="text-right">
												<span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-mono font-bold px-3.5 py-1.5 rounded-xl bg-background border border-border">
													<span className="text-emerald-400">{team.completedStations}</span>
													<span className="text-secondary">/{eventStations.length}</span>
												</span>
											</div>

											{/* Total Points */}
											<div className="text-right">
												<div className="text-2xl sm:text-3xl font-black font-mono text-warning leading-tight">
													{team.totalPoints.toLocaleString("da-DK")}
												</div>
												<div className="text-xs sm:text-sm text-secondary font-mono">
													{formatDuration(team.totalSeconds)}
												</div>
											</div>
										</motion.div>
									);
								})
							)}
						</AnimatePresence>
					</div>
				</section>
			</div>
		</main>
	);
}

function ResultTable({
	results,
	showAverage = true,
	rowStyles,
}: {
	results: Result[];
	showAverage?: boolean;
	rowStyles?: typeof topThreeStyles;
}) {
	const gridColumns = showAverage
		? "grid-cols-[36px_1.5fr_0.7fr_0.8fr_1fr_1.2fr]"
		: "grid-cols-[36px_1.5fr_0.7fr_0.8fr_1fr]";

	return (
		<div className="min-w-175 bg-box-background">
			<div
				className={`grid ${gridColumns} gap-3 border-b border-border px-4 py-4 text-xs font-semibold uppercase tracking-wider text-secondary`}
			>
				<div>#</div>
				<div>Skole</div>
				<div>Klasse</div>
				<div>Hold</div>
				<div>Samlet tid</div>
				{showAverage && <div>Gennemsnit pr. post</div>}
			</div>

			<div className="divide-y divide-border">
				{results.map((result) => {
					const averageSeconds =
						result.visitedStations > 0
							? Math.round(result.totalSeconds / result.visitedStations)
							: 0;
					const style = rowStyles?.[result.id];

					return (
						<div
							key={result.id}
							className={`grid ${gridColumns} items-center gap-3 px-4 py-4 ${
								style?.background ?? ""
							} ${style?.text ?? ""}`}
						>
							<div className={`font-bold ${style?.number ?? "text-warning"}`}>
								{style?.emoji && <span className="mr-1">{style.emoji}</span>}
								{result.id}
							</div>
							<div className="font-semibold">{result.school}</div>
							<div className={style?.secondaryText ?? "text-secondary"}>
								{result.klasse}
							</div>
							<div className={style?.secondaryText ?? "text-secondary"}>
								{result.hold}
							</div>
							<div className="font-mono font-bold">
								{formatDuration(result.totalSeconds)}
							</div>
							{showAverage && (
								<div
									className={`font-mono ${
										style?.secondaryText ?? "text-secondary"
									}`}
								>
									{formatDuration(averageSeconds)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
