"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { IconLoader2, IconTrophy, IconAward } from "@tabler/icons-react";
import { getEvents, getClasses, getTeams, getStationTimes } from "@/libs/API";
import { EventModel } from "@/models/EventModel";
import { ClassModel } from "@/models/ClassModel";
import { TeamModel } from "@/models/TeamModel";
import { StationTimeModel } from "@/models/StationModel";

type Result = {
	rank: number;
	id: number;
	school: string;
	klasse: string;
	hold: string;
	totalSeconds: number;
	visitedStations: number;
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
	if (isNaN(totalSeconds) || totalSeconds <= 0) return "--:--";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ResultsPage() {
	const [events, setEvents] = useState<EventModel[]>([]);
	const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [stationTimes, setStationTimes] = useState<StationTimeModel[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			try {
				setLoading(true);
				const [eventsData, classesData, teamsData, timesData] = await Promise.all([
					getEvents(),
					getClasses(),
					getTeams(),
					getStationTimes(),
				]);
				setEvents(eventsData);
				if (eventsData.length > 0) {
					setSelectedEventId(eventsData[0].id);
				}
				setClasses(classesData);
				setTeams(teamsData);
				setStationTimes(timesData);
			} catch (err) {
				console.error("Fejl ved hentning af resultater:", err);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	// Active event
	const activeEvent = useMemo(() => {
		return events.find((e) => e.id === selectedEventId) || events[0] || null;
	}, [events, selectedEventId]);

	// Classes lookup
	const classMap = useMemo(() => {
		return new Map<number, ClassModel>(classes.map((c) => [c.id, c]));
	}, [classes]);

	// Calculate results dynamically
	const results = useMemo<Result[]>(() => {
		if (!activeEvent) return [];

		const eventTeams = teams.filter((t) => t.eventId === activeEvent.id);
		const calculated: Array<{
			id: number;
			school: string;
			klasse: string;
			hold: string;
			totalSeconds: number;
			visitedStations: number;
		}> = [];

		for (const team of eventTeams) {
			const teamTimes = stationTimes.filter((st) => st.teamId === team.id);
			if (teamTimes.length > 0) {
				const total = teamTimes.reduce((acc, curr) => acc + curr.timeSeconds, 0);
				const teamClass = classMap.get(team.classId);
				calculated.push({
					id: team.id,
					school: teamClass?.school || "Skole",
					klasse: teamClass?.name || "Klasse",
					hold: team.name,
					totalSeconds: total,
					visitedStations: teamTimes.length,
				});
			}
		}

		// Sort by lowest totalSeconds, then more stations visited
		calculated.sort((a, b) => {
			if (b.visitedStations !== a.visitedStations) {
				return b.visitedStations - a.visitedStations;
			}
			return a.totalSeconds - b.totalSeconds;
		});

		return calculated.map((item, idx) => ({
			rank: idx + 1,
			...item,
		}));
	}, [activeEvent, teams, stationTimes, classMap]);

	return (
		<main className="min-h-screen bg-background px-5 py-8 text-primary md:px-9">
			<div className="mx-auto max-w-350">
				{/* Top bar with event selector if multiple */}
				{events.length > 1 && (
					<div className="flex justify-end mb-4">
						<select
							value={selectedEventId || ""}
							onChange={(e) => setSelectedEventId(Number(e.target.value))}
							aria-label="Vælg begivenhed"
							className="bg-box-background border border-border text-xs text-primary rounded-xl px-3 py-2 font-medium"
						>
							{events.map((e) => (
								<option key={e.id} value={e.id}>
									{e.title}
								</option>
							))}
						</select>
					</div>
				)}

				<div className="mb-6">
					<h1 className="uppercase text-4xl sm:text-5xl font-extrabold text-center p-5 mb-8">
						🏆 Dagens Vindere 🏆
					</h1>

					{loading ? (
						<div className="flex flex-col items-center justify-center p-12 text-secondary gap-2">
							<IconLoader2 size={32} className="animate-spin text-primary/60" />
							<p className="text-xs">Beregner stilling og resultater...</p>
						</div>
					) : results.length >= 3 ? (
						<div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-12">
							<ResultTable
								results={results.slice(0, 3)}
								showAverage={false}
								rowStyles={topThreeStyles}
							/>
							<img
								src="/images/victoryroyale.gif"
								alt="Victory Royale"
								className="w-56 sm:w-70 rounded-2xl shadow-xl"
							/>
						</div>
					) : results.length > 0 ? (
						<div className="flex flex-col items-center justify-center gap-6 mb-12">
							<ResultTable
								results={results}
								showAverage={false}
								rowStyles={topThreeStyles}
							/>
						</div>
					) : (
						<div className="text-center p-12 rounded-2xl border border-border bg-box-background mb-10">
							<IconAward size={40} className="mx-auto text-secondary mb-2 opacity-60" />
							<h3 className="font-bold text-lg text-primary">Ingen resultater endnu</h3>
							<p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
								Når postvagterne registrerer holdenes tider, vil stillingen og dagens vindere blive vist her i realtid.
							</p>
						</div>
					)}

					<h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
						Top 10 - Samlet Resultater
					</h2>
				</div>

				<section className="overflow-hidden rounded-2xl border border-border bg-box-background">
					<div className="overflow-x-auto">
						{results.length === 0 ? (
							<div className="p-8 text-center text-secondary text-sm">
								Venter på første tidsregistrering...
							</div>
						) : results.length <= 5 ? (
							<ResultTable results={results} />
						) : (
							<div className="grid gap-px bg-border md:grid-cols-2">
								<ResultTable results={results.slice(0, 5)} />
								<ResultTable results={results.slice(5, 10)} />
							</div>
						)}
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
		<div className="min-w-175 bg-box-background w-full">
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
							: result.totalSeconds;
					const style = rowStyles?.[result.rank];

					return (
						<div
							key={result.id}
							className={`grid ${gridColumns} items-center gap-3 px-4 py-4 transition hover:brightness-95 ${
								style?.background ?? "hover:bg-primary/10"
							} ${style?.text ?? ""}`}
						>
							<div className={`font-bold ${style?.number ?? "text-warning"}`}>
								{style?.emoji && <span className="mr-1">{style.emoji}</span>}
								{result.rank}
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
								<div className={`font-mono ${style?.secondaryText ?? "text-secondary"}`}>
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
