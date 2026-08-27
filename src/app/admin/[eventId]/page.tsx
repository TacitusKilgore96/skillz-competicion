"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "tailwind-variants";
import { EventShell } from "@/app/admin/shell";
import card from "@/components/admin/Card";
import { button } from "@/components/admin/Button";
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
} from "@tabler/icons-react";
import {
	getEventById,
	getClasses,
	getTeams,
	getStations,
	getAccounts,
	getStationTimes,
} from "@/libs/API";
import { EventModel } from "@/models/EventModel";
import { ClassModel } from "@/models/ClassModel";
import { TeamModel } from "@/models/TeamModel";
import { StationModel, StationTimeModel } from "@/models/StationModel";
import { AccountModel } from "@/models/AccountModel";

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

	useEffect(() => {
		const load = async () => {
			setLoading(true);
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
			} catch (e) {
				console.error("Error loading event dashboard:", e);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [eventId]);

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
						<div className={cn(card(), "p-6 bg-white")}>
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
								<div>
									<div className="flex items-center gap-2">
										<h2 className="text-2xl font-bold text-slate-900">
											{event?.title || `Event #${eventId}`}
										</h2>
										<span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
											Aktivt Event
										</span>
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
									</div>
									{event?.description && (
										<p className="mt-2 text-xs text-slate-600 max-w-2xl leading-relaxed">
											{event.description}
										</p>
									)}
								</div>

								<div className="flex items-center gap-2 shrink-0">
									<Link
										href={`/admin/${eventId}/stations`}
										className={cn(
											button(),
											"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
										)}
									>
										<IconFlag size={15} />
										<span>Gå til Stationer</span>
									</Link>
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
		</EventShell>
	);
}
