"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {button} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {createTeam, getClasses, getEvents, getSchools, getTeams} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useState, type FormEvent} from "react";
import card from "@/components/admin/Card";
import {EventSelector} from "@/components/admin/EventSelector";
import {useSelectedEvent} from "@/hooks/useSelectedEvent";

// ── Creation dialog ──────────────────────────────────────────────────────────

interface CreateDialogProps {
	classes: ClassModel[];
	schools: SchoolModel[];
	events: EventModel[];
	defaultEventId?: number | null;
	onClose: () => void;
	onCreated: (team: TeamModel) => void;
}

function CreateTeamDialog({classes, schools, events, defaultEventId, onClose, onCreated}: CreateDialogProps) {
	const relevantClasses = defaultEventId !== null && defaultEventId !== undefined
		? classes.filter(c => c.eventIds?.includes(defaultEventId))
		: classes;
	const availableClasses = relevantClasses.length > 0 ? relevantClasses : classes;

	const [name, setName] = useState("");
	const [classId, setClassId] = useState<number>(() => availableClasses[0]?.id ?? 0);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function getSchoolName(schoolId: number) {
		return schools.find(s => s.id === schoolId)?.name ?? "Ukendt skole";
	}

	function getEventNames(eventIds?: number[]) {
		if (!eventIds || eventIds.length === 0) return "Ingen begivenhed";
		return eventIds.map(id => events.find(e => e.id === id)?.name ?? `Begivenhed #${id}`).join(", ");
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setError("Holdets navn er påkrævet.");
			return;
		}
		if (!classId) {
			setError("Du skal vælge en klasse.");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const created = await createTeam({name: name.trim(), classId: Number(classId)});
			onCreated(created);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Noget gik galt.");
			setSaving(false);
		}
	}

	return (
		<div className={"fixed inset-0 z-50 flex items-center justify-center bg-black/40"}
		     onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
			<div className={cn(card(), "bg-white p-8 flex flex-col gap-4 min-w-96 shadow-xl")}>
				<h2 className={"text-xl font-bold uppercase"}>Nyt hold</h2>

				<form onSubmit={handleSubmit} className={"flex flex-col gap-4"}>
					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>Navn</label>
						<input
							className={textField()}
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder={"f.eks. De Hurtige Smede"}
							autoFocus
						/>
					</div>

					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>Klasse</label>
						<select
							className={cn(textField(), "cursor-pointer")}
							value={classId}
							onChange={e => setClassId(Number(e.target.value))}
						>
							{availableClasses.length === 0 ? (
								<option value={0}>Ingen klasser oprettet endnu</option>
							) : (
								availableClasses.map(c => (
									<option key={c.id} value={c.id}>
										{c.name} ({getSchoolName(c.schoolId)}) - {getEventNames(c.eventIds)}
									</option>
								))
							)}
						</select>
					</div>

					{error && <p className={"text-red-500 text-sm"}>{error}</p>}

					<div className={"flex gap-2 justify-end pt-2"}>
						<button type={"button"} className={button({shape: "pill"})} onClick={onClose}
						        disabled={saving}>
							Annuller
						</button>
						<button type={"submit"}
						        className={cn(button({shape: "pill"}), "bg-hover text-white border-hover")}
						        disabled={saving || availableClasses.length === 0}>
							{saving ? "Opretter..." : "Opret"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

// ── Teams List Page ──────────────────────────────────────────────────────────

export default function TeamsPage() {
	const {data: teams, loading: loadingTeams, error: errorTeams, setData: setTeams} =
		useAsync<TeamModel[]>(async () => getTeams(), []);

	const {data: classes} = useAsync<ClassModel[]>(async () => getClasses(), []);
	const {data: schools} = useAsync<SchoolModel[]>(async () => getSchools(), []);
	const {data: events, loading: loadingEvents} = useAsync<EventModel[]>(async () => getEvents(), []);

	const {selectedEventId, setSelectedEventId} = useSelectedEvent();

	const router = useRouter();

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [search, setSearch] = useState("");

	function getClass(classId: number) {
		return classes?.find(c => c.id === classId);
	}

	function getSchoolName(schoolId?: number) {
		if (!schoolId) return "Ukendt skole";
		return schools?.find(s => s.id === schoolId)?.name ?? "Ukendt skole";
	}

	const filteredTeams = teams?.filter(team => {
		const cls = getClass(team.classId);

		// Filter by selected event
		if (selectedEventId !== null && !cls?.eventIds?.includes(selectedEventId)) {
			return false;
		}

		// Text search
		const className = cls?.name ?? "";
		const schoolName = getSchoolName(cls?.schoolId);
		const teamEvents = events?.filter(e => cls?.eventIds?.includes(e.id)) ?? [];
		const eventNames = teamEvents.map(e => e.name).join(" ");

		return (
			team.name.toLowerCase().includes(search.toLowerCase()) ||
			className.toLowerCase().includes(search.toLowerCase()) ||
			schoolName.toLowerCase().includes(search.toLowerCase()) ||
			eventNames.toLowerCase().includes(search.toLowerCase())
		);
	});

	function handleCreated(newTeam: TeamModel) {
		setTeams(prev => [...(prev ?? []), newTeam]);
		setShowCreateDialog(false);
		router.push(`/admin/teams/${newTeam.id}`);
	}

	return (
		<AdminShell pageTitle={"Hold"} currentPath={"/admin/teams"}>
			<div className={"p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full"}>
				{/* Event Selector Box */}
				<EventSelector
					events={events}
					selectedEventId={selectedEventId}
					onSelectEvent={setSelectedEventId}
					loading={loadingEvents}
				/>

				{/* Top Bar */}
				<div className={"flex items-center justify-between gap-4"}>
					<div className={"flex-1 max-w-md"}>
						<input
							className={textField()}
							placeholder={"Søg efter hold, klasse, skole eller begivenhed..."}
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>

					<button
						className={cn(button({shape: "pill"}), "bg-hover text-white border-hover flex items-center gap-2 font-semibold")}
						onClick={() => setShowCreateDialog(true)}
					>
						<span>+</span>
						<span>Opret hold</span>
					</button>
				</div>

				{/* Table / List */}
				<div className={cn(card(), "bg-white overflow-hidden")}>
					<div className={"grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500"}>
						<span className={"col-span-4"}>Holdnavn</span>
						<span className={"col-span-3"}>Klasse</span>
						<span className={"col-span-3"}>Begivenheder</span>
						<span className={"col-span-2 text-right"}>Skole</span>
					</div>

					<AsyncDataRenderer
						loading={loadingTeams}
						error={errorTeams}
						data={filteredTeams ?? null}
						renderData={teamsList => {
							if (teamsList.length === 0) {
								return (
									<div className={"p-8 text-center text-gray-400"}>
										{selectedEventId !== null
											? "Ingen hold fundet for den valgte begivenhed"
											: "Ingen hold fundet"}
									</div>
								);
							}
							return (
								<div className={"divide-y divide-gray-100"}>
									{teamsList.map(team => {
										const cls = getClass(team.classId);
										const schoolName = getSchoolName(cls?.schoolId);
										const teamEvents = events?.filter(e => cls?.eventIds?.includes(e.id)) ?? [];
										return (
											<Link
												key={team.id}
												href={`/admin/teams/${team.id}`}
												className={"grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"}
											>
												<span className={"col-span-4 font-semibold text-gray-800"}>
													{team.name}
												</span>
												<span className={"col-span-3 text-gray-600 text-sm"}>
													{cls?.name ?? "Ukendt klasse"}
												</span>
												<div className={"col-span-3 flex flex-wrap gap-1 items-center"}>
													{teamEvents.length === 0 ? (
														<span className={"text-gray-400 text-xs italic"}>Ingen</span>
													) : (
														teamEvents.map(ev => (
															<span
																key={ev.id}
																className={"px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 truncate max-w-full"}
																title={`${ev.name} (${ev.date})`}
															>
																📅 {ev.name}
															</span>
														))
													)}
												</div>
												<span className={"col-span-2 text-right text-gray-500 text-sm truncate"}>
													{schoolName}
												</span>
											</Link>
										);
									})}
								</div>
							);
						}}
					/>
				</div>
			</div>

			{showCreateDialog && (
				<CreateTeamDialog
					classes={classes ?? []}
					schools={schools ?? []}
					events={events ?? []}
					defaultEventId={selectedEventId}
					onClose={() => setShowCreateDialog(false)}
					onCreated={handleCreated}
				/>
			)}
		</AdminShell>
	);
}
