"use client";

import { AdminShell } from "@/app/admin/shell";
import { cn } from "tailwind-variants";
import textField from "@/components/admin/TextField";
import { button } from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {
	deleteStation,
	getAccountsByStationId,
	getClasses,
	getEvents,
	getSchools,
	getStationById,
	getTeams,
	updateStation
} from "@/libs/API";
import type { AccountModel } from "@/models/AccountModel";
import AsyncDataRenderer from "@/components/DataComponent";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { use, useState, type FormEvent } from "react";
import card from "@/components/admin/Card";

// Helper to normalize and clean up time input
function normalizeTime(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return "";
	return trimmed;
}

// ── Edit Form ────────────────────────────────────────────────────────────────

interface EditFormProps {
	station: StationModel;
	events: EventModel[];
	classes: ClassModel[];
	schools: SchoolModel[];
	teams: TeamModel[];
	guardAccounts: AccountModel[];
	onUpdated: (station: StationModel) => void;
	onDeleted: () => void;
}

function EditForm({ station, events, classes, schools, teams, guardAccounts, onUpdated, onDeleted }: EditFormProps) {
	// Station basic details
	const [name, setName] = useState(station.name);
	const [eventId, setEventId] = useState<number>(station.eventId);
	const [savingBasic, setSavingBasic] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [basicError, setBasicError] = useState<string | null>(null);
	const [basicSaved, setBasicSaved] = useState(false);

	// Times draft state: map of teamId -> string time
	const [timesDraft, setTimesDraft] = useState<Record<number, string>>(() => {
		const initial: Record<number, string> = {};
		station.entries?.forEach(e => {
			initial[e.teamId] = e.time;
		});
		return initial;
	});

	// Saving states for times
	const [savingTimes, setSavingTimes] = useState(false);
	const [savingTeamId, setSavingTeamId] = useState<number | null>(null);
	const [timesError, setTimesError] = useState<string | null>(null);
	const [timesSuccess, setTimesSuccess] = useState<string | null>(null);

	// Team search / filter within station
	const [teamSearch, setTeamSearch] = useState("");
	const [filterUnsetOnly, setFilterUnsetOnly] = useState(false);

	const currentEvent = events.find(e => e.id === eventId);
	const isBasicDirty = name !== station.name || eventId !== station.eventId;

	// Eligible teams for this station's event
	const eventClasses = classes.filter(c => c.eventIds?.includes(eventId));
	const eventClassIds = new Set(eventClasses.map(c => c.id));

	// Combine all teams from event plus any team that already has an entry
	const existingEntryTeamIds = new Set((station.entries ?? []).map(e => e.teamId));
	const allRelevantTeams = teams.filter(t => eventClassIds.has(t.classId) || existingEntryTeamIds.has(t.id));

	// Helpers
	function getClassName(classId: number) {
		return classes.find(c => c.id === classId)?.name ?? "Ukendt klasse";
	}

	function getSchoolName(classId: number) {
		const cls = classes.find(c => c.id === classId);
		if (!cls) return "Ukendt skole";
		return schools.find(s => s.id === cls.schoolId)?.name ?? "Ukendt skole";
	}

	// Calculate stats
	const totalTeamsCount = allRelevantTeams.length;
	const setTeams = allRelevantTeams.filter(t => {
		const val = timesDraft[t.id];
		return val !== undefined && val.trim() !== "";
	});
	const setTimesCount = setTeams.length;
	const unsetTimesCount = totalTeamsCount - setTimesCount;

	// Find fastest time if available (formats like "01:35" or "1:35")
	const sortedTimes = [...setTeams]
		.map(t => ({ team: t, time: timesDraft[t.id]!.trim() }))
		.sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));
	const fastest = sortedTimes[0];

	// Save basic station details (name, eventId)
	async function handleSaveBasic(e: FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setBasicError("Stationens navn er påkrævet.");
			return;
		}
		if (eventId === undefined || eventId === null) {
			setBasicError("Du skal vælge en begivenhed.");
			return;
		}
		setSavingBasic(true);
		setBasicError(null);
		try {
			const updated = await updateStation(station.id, {
				name: name.trim(),
				eventId: Number(eventId)
			});
			onUpdated(updated);
			setBasicSaved(true);
			setTimeout(() => setBasicSaved(false), 2000);
		} catch (err) {
			setBasicError(err instanceof Error ? err.message : "Kunne ikke gemme stationen.");
		} finally {
			setSavingBasic(false);
		}
	}

	// Delete station
	async function handleDelete() {
		const entryCount = station.entries?.filter(e => e.time && e.time.trim() !== "").length ?? 0;
		const warning = entryCount > 0
			? `Er du sikker på at du vil slette "${station.name}"? Der er allerede ${entryCount} registrerede holdtider på denne station.`
			: `Er du sikker på at du vil slette "${station.name}"?`;

		if (!confirm(warning)) return;
		setDeleting(true);
		try {
			await deleteStation(station.id);
			onDeleted();
		} catch (err) {
			setBasicError(err instanceof Error ? err.message : "Sletning fejlede.");
			setDeleting(false);
		}
	}

	// Save a single team's time
	async function handleSaveSingleTime(teamId: number) {
		setSavingTeamId(teamId);
		setTimesError(null);
		try {
			const newTime = normalizeTime(timesDraft[teamId] ?? "");
			const updatedEntries = [...(station.entries ?? [])];
			const idx = updatedEntries.findIndex(e => e.teamId === teamId);
			if (idx >= 0) {
				updatedEntries[idx] = { teamId, time: newTime };
			} else {
				updatedEntries.push({ teamId, time: newTime });
			}

			const updated = await updateStation(station.id, { entries: updatedEntries });
			onUpdated(updated);
			setTimesSuccess(`Tid gemt for holdet.`);
			setTimeout(() => setTimesSuccess(null), 2500);
		} catch (err) {
			setTimesError(err instanceof Error ? err.message : "Kunne ikke gemme tiden.");
		} finally {
			setSavingTeamId(null);
		}
	}

	// Reset / Clear time for a team
	async function handleClearSingleTime(teamId: number) {
		setTimesDraft(prev => ({ ...prev, [teamId]: "" }));
		setSavingTeamId(teamId);
		setTimesError(null);
		try {
			const updatedEntries = [...(station.entries ?? [])].map(e =>
				e.teamId === teamId ? { ...e, time: "" } : e
			);
			const updated = await updateStation(station.id, { entries: updatedEntries });
			onUpdated(updated);
			setTimesSuccess(`Tid nulstillet for holdet.`);
			setTimeout(() => setTimesSuccess(null), 2500);
		} catch (err) {
			setTimesError(err instanceof Error ? err.message : "Kunne ikke nulstille tiden.");
		} finally {
			setSavingTeamId(null);
		}
	}

	// Save all draft times at once
	async function handleSaveAllTimes() {
		setSavingTimes(true);
		setTimesError(null);
		try {
			const updatedEntries: StationEntryModel[] = Object.entries(timesDraft).map(([tId, timeVal]) => ({
				teamId: Number(tId),
				time: normalizeTime(timeVal)
			}));

			const updated = await updateStation(station.id, { entries: updatedEntries });
			onUpdated(updated);
			setTimesSuccess("Alle tider er gemt!");
			setTimeout(() => setTimesSuccess(null), 2500);
		} catch (err) {
			setTimesError(err instanceof Error ? err.message : "Kunne ikke gemme tiderne.");
		} finally {
			setSavingTimes(false);
		}
	}

	// Filter teams list for search / unset only
	const filteredTeams = allRelevantTeams.filter(t => {
		const isSet = timesDraft[t.id] !== undefined && timesDraft[t.id].trim() !== "";
		if (filterUnsetOnly && isSet) return false;

		const clsName = getClassName(t.classId);
		const schName = getSchoolName(t.classId);
		return (
			t.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
			clsName.toLowerCase().includes(teamSearch.toLowerCase()) ||
			schName.toLowerCase().includes(teamSearch.toLowerCase())
		);
	});

	// Check if any draft time is different from saved entries
	const hasUnsavedTimes = allRelevantTeams.some(t => {
		const draftVal = (timesDraft[t.id] ?? "").trim();
		const savedVal = (station.entries?.find(e => e.teamId === t.id)?.time ?? "").trim();
		return draftVal !== savedVal;
	});

	return (
		<div className={"flex flex-col gap-8"}>
			{/* Station Overview & Basic Details Card */}
			<div className={cn(card(), "bg-white p-8 flex flex-col gap-6 shadow-sm")}>
				<div className={"flex items-center justify-between pb-4 border-b border-gray-200"}>
					<div>
						<span className={"text-xs uppercase font-bold text-gray-400 tracking-wider"}>
							Station #{station.id}
						</span>
						<h2 className={"text-2xl font-bold text-gray-800"}>{station.name}</h2>
					</div>
					<div className={"flex items-center gap-2"}>
						{currentEvent && (
							<Link
								href={`/admin/events/${currentEvent.id}`}
								className={"px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 hover:underline"}
							>
								📅 {currentEvent.name}
							</Link>
						)}
					</div>
				</div>

				<form onSubmit={handleSaveBasic} className={"flex flex-col gap-5"}>
					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>
							Navn på station
						</label>
						<input
							className={textField()}
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder={"Stationens navn"}
						/>
					</div>

					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>
							Tilknyttet begivenhed
						</label>
						<select
							className={cn(textField(), "cursor-pointer")}
							value={eventId}
							onChange={e => setEventId(Number(e.target.value))}
						>
							{events.map(ev => (
								<option key={ev.id} value={ev.id}>
									{ev.name} ({ev.date}) [{ev.status}]
								</option>
							))}
						</select>
					</div>

					{basicError && <p className={"text-red-500 text-sm"}>{basicError}</p>}
					{basicSaved && <p className={"text-green-600 text-sm font-semibold"}>✓ Ændringer gemt!</p>}

					<div className={"flex items-center justify-between pt-2 border-t border-gray-100"}>
						<button
							type={"button"}
							className={cn(button({ shape: "pill" }), "text-red-600 hover:bg-red-50 border-red-200")}
							onClick={handleDelete}
							disabled={deleting || savingBasic}
						>
							{deleting ? "Sletter..." : "Slet station"}
						</button>

						<button
							type={"submit"}
							className={cn(button({ shape: "pill" }), "bg-hover text-white border-hover font-semibold")}
							disabled={savingBasic || !isBasicDirty}
						>
							{savingBasic ? "Gemmer..." : "Gem ændringer"}
						</button>
					</div>
				</form>
			</div>

			{/* Station Guard Login Credentials Card */}
			<div className={cn(card(), "bg-white p-6 flex flex-col gap-4 shadow-sm border border-amber-200/80 bg-amber-50/20")}>
				<div className={"flex items-center justify-between"}>
					<div className={"flex items-center gap-2"}>
						<span className={"text-lg"}>🛡️</span>
						<h3 className={"text-base font-bold uppercase text-gray-800"}>Tilknyttet Stationsvagt Konto</h3>
					</div>
					<span className={"text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200"}>
						Stationsvagt
					</span>
				</div>

				<p className={"text-xs text-gray-600"}>
					Denne konto er oprettet automatisk til denne station. Stationsvagten bruger disse oplysninger til at logge ind og tage tid. Kontoen har ikke adgang til Kontrol Centeret.
				</p>

				{guardAccounts.length === 0 ? (
					<p className={"text-xs text-gray-400 italic"}>Ingen stationsvagt-konto fundet.</p>
				) : (
					<div className={"flex flex-col gap-2"}>
						{guardAccounts.map((acc) => (
							<div
								key={acc.id}
								className={"p-3 bg-white rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"}
							>
								<div className={"flex flex-col gap-0.5"}>
									<div className={"flex items-center gap-2"}>
										<span className={"text-xs text-gray-400 font-semibold uppercase"}>Brugernavn:</span>
										<strong className={"text-gray-900 font-mono"}>{acc.username}</strong>
									</div>
									<div className={"flex items-center gap-2"}>
										<span className={"text-xs text-gray-400 font-semibold uppercase"}>Adgangskode:</span>
										<span className={"font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold"}>
											{acc.password}
										</span>
									</div>
								</div>

								<div className={"flex items-center gap-2"}>
									<Link
										href={`/admin/accounts/${acc.id}`}
										className={cn(button({ shape: "pill" }), "text-xs hover:bg-hover hover:text-white")}
									>
										Administrer konto →
									</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Time Entries & Activity Tracking Card */}
			<div className={cn(card(), "bg-white p-8 flex flex-col gap-6 shadow-sm")}>
				{/* Header & Stats */}
				<div className={"flex flex-col gap-4 pb-4 border-b border-gray-200"}>
					<div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-2"}>
						<div>
							<h3 className={"text-xl font-bold text-gray-800"}>Tidtagning & Holdtider</h3>
							<p className={"text-sm text-gray-500"}>
								Registrer og rediger tider for de deltagende hold på denne post.
							</p>
						</div>

						{hasUnsavedTimes && (
							<button
								type={"button"}
								className={cn(button({ shape: "pill" }), "bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-sm text-sm")}
								onClick={handleSaveAllTimes}
								disabled={savingTimes}
							>
								{savingTimes ? "Gemmer alle..." : "💾 Gem alle tider"}
							</button>
						)}
					</div>

					{/* Metric Stat Badges */}
					<div className={"grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"}>
						<div className={"p-3 bg-gray-50 rounded-xl border border-gray-200/80"}>
							<p className={"text-xs uppercase font-bold text-gray-500"}>Tilmeldte hold</p>
							<p className={"text-2xl font-black text-gray-800 mt-1"}>{totalTeamsCount}</p>
						</div>

						<div className={"p-3 bg-emerald-50 rounded-xl border border-emerald-200/80"}>
							<p className={"text-xs uppercase font-bold text-emerald-700"}>Tider sat</p>
							<p className={"text-2xl font-black text-emerald-700 mt-1"}>
								{setTimesCount} <span className={"text-xs font-normal"}>/ {totalTeamsCount}</span>
							</p>
						</div>

						<div className={"p-3 bg-amber-50 rounded-xl border border-amber-200/80"}>
							<p className={"text-xs uppercase font-bold text-amber-700"}>Mangler tid</p>
							<p className={"text-2xl font-black text-amber-700 mt-1"}>{unsetTimesCount}</p>
						</div>

						<div className={"p-3 bg-indigo-50 rounded-xl border border-indigo-200/80"}>
							<p className={"text-xs uppercase font-bold text-indigo-700"}>Hurtigste tid</p>
							<p className={"text-lg font-black text-indigo-800 mt-1 truncate"}>
								{fastest ? (
									<span>
										⏱️ {fastest.time} <span className={"text-xs font-normal text-indigo-600"}>({fastest.team.name})</span>
									</span>
								) : (
									<span className={"text-sm font-medium text-gray-400"}>Ingen tider endnu</span>
								)}
							</p>
						</div>
					</div>
				</div>

				{/* Search & Filter Bar */}
				<div className={"flex flex-col sm:flex-row items-center justify-between gap-3"}>
					<div className={"flex-1 w-full max-w-sm"}>
						<input
							className={textField()}
							placeholder={"Søg efter hold, klasse eller skole..."}
							value={teamSearch}
							onChange={e => setTeamSearch(e.target.value)}
						/>
					</div>

					<div className={"flex items-center gap-2"}>
						<button
							type={"button"}
							className={cn(
								button({ shape: "pill" }),
								"text-xs font-semibold px-3 py-1.5",
								filterUnsetOnly ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-gray-100 text-gray-700"
							)}
							onClick={() => setFilterUnsetOnly(prev => !prev)}
						>
							{filterUnsetOnly ? "Viser kun manglende (filter aktiv)" : "Vis kun manglende tider"}
						</button>
					</div>
				</div>

				{/* Feedback alerts */}
				{timesError && (
					<div className={"p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"}>
						{timesError}
					</div>
				)}
				{timesSuccess && (
					<div className={"p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold"}>
						✓ {timesSuccess}
					</div>
				)}

				{/* Teams Times Table */}
				<div className={"overflow-hidden border border-gray-200 rounded-xl"}>
					<div className={"grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500"}>
						<span className={"col-span-4"}>Hold</span>
						<span className={"col-span-3"}>Klasse & Skole</span>
						<span className={"col-span-2"}>Status</span>
						<span className={"col-span-3 text-right"}>Tid (MM:SS)</span>
					</div>

					{filteredTeams.length === 0 ? (
						<div className={"p-8 text-center text-gray-400"}>
							{allRelevantTeams.length === 0
								? "Der er ingen hold tilknyttet denne begivenheds klasser endnu."
								: "Ingen hold matcher søgningen."}
						</div>
					) : (
						<div className={"divide-y divide-gray-100"}>
							{filteredTeams.map(team => {
								const savedTime = station.entries?.find(e => e.teamId === team.id)?.time ?? "";
								const currentTime = timesDraft[team.id] ?? "";
								const isSet = currentTime.trim().length > 0;
								const isDirty = currentTime.trim() !== savedTime.trim();
								const isSavingThis = savingTeamId === team.id;

								return (
									<div
										key={team.id}
										className={cn(
											"grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors",
											isDirty ? "bg-blue-50/40" : "hover:bg-gray-50/70"
										)}
									>
										{/* Holdnavn */}
										<div className={"col-span-4 flex flex-col"}>
											<Link
												href={`/admin/teams/${team.id}`}
												className={"font-semibold text-gray-800 hover:text-blue-600 hover:underline"}
											>
												{team.name}
											</Link>
										</div>

										{/* Klasse & Skole */}
										<div className={"col-span-3 flex flex-col text-xs text-gray-600"}>
											<span className={"font-medium text-gray-700"}>{getClassName(team.classId)}</span>
											<span className={"text-gray-400 truncate"}>{getSchoolName(team.classId)}</span>
										</div>

										{/* Status Badge */}
										<div className={"col-span-2"}>
											{isSet ? (
												<span className={"px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 inline-flex items-center gap-1"}>
													<span>✓</span> Sat
												</span>
											) : (
												<span className={"px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700"}>
													Ikke sat
												</span>
											)}
										</div>

										{/* Time Input & Actions */}
										<div className={"col-span-3 flex items-center justify-end gap-2"}>
											<input
												className={cn(
													textField(),
													"w-24 text-center font-mono font-bold text-sm py-1.5 px-2",
													isDirty ? "border-blue-400 ring-2 ring-blue-100" : ""
												)}
												placeholder={"00:00"}
												value={currentTime}
												onChange={e => {
													const val = e.target.value;
													setTimesDraft(prev => ({ ...prev, [team.id]: val }));
												}}
												onKeyDown={e => {
													if (e.key === "Enter") {
														e.preventDefault();
														handleSaveSingleTime(team.id);
													}
												}}
											/>

											{isDirty ? (
												<button
													type={"button"}
													className={cn(
														button({ shape: "pill" }),
														"bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold shadow-sm"
													)}
													onClick={() => handleSaveSingleTime(team.id)}
													disabled={isSavingThis}
													title="Gem tid for dette hold"
												>
													{isSavingThis ? "..." : "Gem"}
												</button>
											) : isSet ? (
												<button
													type={"button"}
													className={cn(
														button({ shape: "pill" }),
														"text-xs px-2.5 py-1 text-gray-400 hover:text-red-600 hover:bg-red-50 border-transparent"
													)}
													onClick={() => handleClearSingleTime(team.id)}
													disabled={isSavingThis}
													title="Nulstil tid"
												>
													✕
												</button>
											) : (
												<button
													type={"button"}
													className={cn(
														button({ shape: "pill" }),
														"text-xs px-2.5 py-1 text-gray-400 opacity-40 cursor-default border-transparent"
													)}
													disabled
												>
													—
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ── Station Detail Page ──────────────────────────────────────────────────────

export default function StationDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const stationId = parseInt(resolvedParams.id, 10);
	const router = useRouter();

	const {
		data: station,
		loading,
		error,
		setData: setStation
	} = useAsync<StationModel | undefined>(async () => getStationById(stationId), [stationId]);

	const { data: events } = useAsync<EventModel[]>(getEvents, []);
	const { data: classes } = useAsync<ClassModel[]>(getClasses, []);
	const { data: schools } = useAsync<SchoolModel[]>(getSchools, []);
	const { data: teams } = useAsync<TeamModel[]>(getTeams, []);
	const { data: guardAccounts } = useAsync<AccountModel[]>(() => getAccountsByStationId(stationId), [stationId]);

	function handleUpdated(updated: StationModel) {
		setStation(updated);
	}

	function handleDeleted() {
		router.push("/admin/stations");
	}

	return (
		<AdminShell pageTitle={"Station"} currentPath={"/admin/stations"}>
			<div className={"p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full"}>
				<div>
					<Link
						href={"/admin/stations"}
						className={"text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"}
					>
						← Tilbage til stationer
					</Link>
				</div>

				<AsyncDataRenderer
					loading={loading}
					error={error}
					data={station ?? null}
					renderData={stationData => {
						if (!stationData) {
							return (
								<div className={cn(card(), "bg-white p-8 text-center text-gray-500 flex flex-col items-center gap-4")}>
									<p>Stationen blev ikke fundet.</p>
									<Link href={"/admin/stations"} className={button({ shape: "pill" })}>
										Gå til oversigt
									</Link>
								</div>
							);
						}
						return (
							<EditForm
								key={stationData.id}
								station={stationData}
								events={events ?? []}
								classes={classes ?? []}
								schools={schools ?? []}
								teams={teams ?? []}
								guardAccounts={guardAccounts ?? []}
								onUpdated={handleUpdated}
								onDeleted={handleDeleted}
							/>
						);
					}}
				/>
			</div>
		</AdminShell>
	);
}
