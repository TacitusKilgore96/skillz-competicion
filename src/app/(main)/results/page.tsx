"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
	const [loading, setLoading] = useState(true);

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
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
		const interval = setInterval(fetchData, 3000);
		return () => clearInterval(interval);
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

	// Timing state calculation
	const [, setTick] = useState(0);
	useEffect(() => {
		const ticker = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(ticker);
	}, []);

	const timing: EventTimingState = useMemo(() => {
		return computeEventTiming(activeEvent);
	}, [activeEvent, activeEvent?.startedAt, activeEvent?.status, activeEvent?.isConfirmedOver]);

	// Standings
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

	// 1. INACTIVE STATE: Waiting for event start
	if (timing.phase === "INACTIVE" || !activeEvent || activeEvent.status === "CREATED") {
		return (
			<main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9 flex flex-col justify-center items-center">
				<div className="mx-auto max-w-350 text-center space-y-6">
					<h1 className="uppercase text-4xl sm:text-5xl font-extrabold p-5">
						🏆 Skills Konkurrence 🏆
					</h1>
					<div className="rounded-2xl border border-border bg-box-background p-10 max-w-lg mx-auto space-y-4">
						<div className="text-3xl">⏳</div>
						<h2 className="text-2xl font-bold">Venter på startsignal</h2>
						<p className="text-sm text-secondary">
							Konkurrencen for <span className="text-primary font-semibold">{activeEvent?.title || "begivenheden"}</span> er ikke startet endnu.
							Leaderboardet opdateres automatisk så snart starten går.
						</p>
					</div>
				</div>
			</main>
		);
	}

	// 2. SUSPENSE BLACKOUT: Last 30 min
	if (timing.phase === "RUNNING_SUSPENSE") {
		return (
			<main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9 flex flex-col justify-center items-center">
				<div className="mx-auto max-w-350 text-center space-y-6">
					<h1 className="uppercase text-4xl sm:text-5xl font-extrabold p-5 text-warning">
						🔥 Spændingen Stiger! 🔥
					</h1>
					<div className="rounded-2xl border border-border bg-box-background p-10 max-w-xl mx-auto space-y-6 shadow-2xl">
						<div className="text-5xl animate-bounce [animation-duration:2s]">👀</div>
						<div className="space-y-2">
							<h2 className="text-3xl font-black">Stillingen er hemmelig</h2>
							<p className="text-sm text-secondary">
								Leaderboardet er skjult i finalefasen. Alle hold kæmper til sidste sekund! Vinderne afsløres lige efter tidens udløb.
							</p>
						</div>

						<div className="p-6 rounded-2xl bg-background border border-border">
							<div className="text-xs uppercase font-bold text-secondary mb-2">
								Resterende Konkurrencetid
							</div>
							<div className="text-6xl font-black font-mono text-warning">
								{timing.formattedRemaining}
							</div>
						</div>
					</div>
				</div>
			</main>
		);
	}

	// 3. PENDING VERIFICATION
	if (timing.phase === "TIME_OVER_PENDING") {
		return (
			<main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9 flex flex-col justify-center items-center">
				<div className="mx-auto max-w-350 text-center space-y-6">
					<h1 className="uppercase text-4xl sm:text-5xl font-extrabold p-5">
						⏰ Tiden er Udløbet! ⏰
					</h1>
					<div className="rounded-2xl border border-border bg-box-background p-10 max-w-lg mx-auto space-y-4">
						<div className="text-4xl animate-pulse">🎯</div>
						<h2 className="text-2xl font-bold">Gør klar til resultaterne</h2>
						<p className="text-sm text-secondary">
							Tidsregistreringen er afsluttet. Dagens vindere og det officielle vinderpodie vises her på skærmen om et øjeblik!
						</p>
					</div>
				</div>
			</main>
		);
	}

	// 4. LIVE / FINAL RESULTS VIEW (Using original user design with tables and GIF)
	return (
		<main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9">
			<div className="mx-auto max-w-350">
				{/* Top Header */}
				<div className="mb-6">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
						<div>
							<div className="text-xs uppercase font-bold text-secondary tracking-wider">
								{activeEvent?.title}
							</div>
							{timing.phase === "RUNNING_LIVE" && (
								<div className="flex items-center gap-2 mt-1">
									<span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse" />
									<span className="text-xs font-bold text-success font-mono uppercase">
										Live · Tid tilbage: {timing.formattedRemaining}
									</span>
								</div>
							)}
						</div>
					</div>

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
						<div className="grid gap-px bg-border md:grid-cols-2">
							<ResultTable results={resultsList.slice(0, 5)} />
							<ResultTable results={resultsList.slice(5, 10)} />
						</div>
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
				{results.length === 0 ? (
					<div className="p-6 text-center text-xs text-secondary">
						Ingen resultater registreret endnu.
					</div>
				) : (
					results.map((result) => {
						const averageSeconds =
							result.visitedStations > 0
								? Math.round(result.totalSeconds / result.visitedStations)
								: 0;
						const style = rowStyles?.[result.id];

						return (
							<div
								key={result.id}
								className={`grid ${gridColumns} items-center gap-3 px-4 py-4 transition hover:brightness-95 ${
									style?.background ?? "hover:bg-primary/10"
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
					})
				)}
			</div>
		</div>
	);
}
