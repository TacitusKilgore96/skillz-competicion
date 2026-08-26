"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {button} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {createClass, getClasses, getEvents, getSchools, getTeams} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useState, type FormEvent} from "react";
import card from "@/components/admin/Card";
import {EventSelector} from "@/components/admin/EventSelector";
import {useSelectedEvent} from "@/hooks/useSelectedEvent";

// ── Creation dialog ──────────────────────────────────────────────────────────

interface CreateDialogProps {
	schools: SchoolModel[];
	events: EventModel[];
	defaultEventId?: number | null;
	onClose: () => void;
	onCreated: (cls: ClassModel) => void;
}

function CreateClassDialog({schools, events, defaultEventId, onClose, onCreated}: CreateDialogProps) {
	const [name, setName] = useState("");
	const [schoolId, setSchoolId] = useState<number>(schools[0]?.id ?? 0);
	const [eventIds, setEventIds] = useState<number[]>(() => {
		if (defaultEventId !== null && defaultEventId !== undefined && events.some(e => e.id === defaultEventId)) {
			return [defaultEventId];
		}
		return events[0] ? [events[0].id] : [];
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function toggleEvent(id: number) {
		setEventIds(prev =>
			prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
		);
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setError("Klassens navn er påkrævet.");
			return;
		}
		if (!schoolId) {
			setError("Du skal vælge en skole.");
			return;
		}
		if (eventIds.length === 0) {
			setError("Du skal vælge mindst én begivenhed.");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const created = await createClass({
				name: name.trim(),
				schoolId: Number(schoolId),
				eventIds: eventIds.map(Number)
			});
			onCreated(created);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Noget gik galt.");
			setSaving(false);
		}
	}

	return (
		<div className={"fixed inset-0 z-50 flex items-center justify-center bg-black/40"}
		     onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
			<div className={cn(card(), "bg-white p-8 flex flex-col gap-4 min-w-96 max-w-lg w-full shadow-xl")}>
				<h2 className={"text-xl font-bold uppercase"}>Ny klasse</h2>

				<form onSubmit={handleSubmit} className={"flex flex-col gap-4"}>
					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>Navn</label>
						<input
							className={textField()}
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder={"f.eks. 10.A eller Grundforløb 1"}
							autoFocus
						/>
					</div>

					<div className={"flex flex-col gap-1.5"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase flex items-center justify-between"}>
							<span>Begivenheder</span>
							{eventIds.length > 0 && (
								<span className={"text-blue-600 font-normal text-xs lowercase"}>
									({eventIds.length} valgt)
								</span>
							)}
						</label>
						{events.length === 0 ? (
							<p className={"text-sm text-gray-400 italic"}>Ingen begivenheder oprettet endnu</p>
						) : (
							<div className={"flex flex-col gap-1.5 max-h-44 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50/50"}>
								{events.map(ev => {
									const isChecked = eventIds.includes(ev.id);
									return (
										<label
											key={ev.id}
											className={cn(
												"flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm",
												isChecked ? "bg-blue-50 border border-blue-200 font-medium text-blue-900" : "hover:bg-gray-100 text-gray-700"
											)}
										>
											<div className={"flex items-center gap-2.5"}>
												<input
													type="checkbox"
													className={"rounded text-blue-600 focus:ring-blue-500 h-4 w-4"}
													checked={isChecked}
													onChange={() => toggleEvent(ev.id)}
												/>
												<span>{ev.name}</span>
												<span className={"text-xs text-gray-400"}>({ev.date})</span>
											</div>
											<span className={"text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600"}>
												{ev.status}
											</span>
										</label>
									);
								})}
							</div>
						)}
					</div>

					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>Skole</label>
						<select
							className={cn(textField(), "cursor-pointer")}
							value={schoolId}
							onChange={e => setSchoolId(Number(e.target.value))}
						>
							{schools.length === 0 ? (
								<option value={0}>Ingen skoler oprettet endnu</option>
							) : (
								schools.map(s => (
									<option key={s.id} value={s.id}>{s.name}</option>
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
						        disabled={saving || schools.length === 0 || events.length === 0}>
							{saving ? "Opretter..." : "Opret"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

// ── Classes List Page ────────────────────────────────────────────────────────

export default function ClassesPage() {
	const {data: classes, loading: loadingClasses, error: errorClasses, setData: setClasses} =
		useAsync<ClassModel[]>(async () => getClasses(), []);

	const {data: schools} = useAsync<SchoolModel[]>(async () => getSchools(), []);
	const {data: events, loading: loadingEvents} = useAsync<EventModel[]>(async () => getEvents(), []);
	const {data: teams} = useAsync<TeamModel[]>(async () => getTeams(), []);

	const {selectedEventId, setSelectedEventId} = useSelectedEvent();

	const router = useRouter();

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [search, setSearch] = useState("");

	function getSchoolName(schoolId: number) {
		return schools?.find(s => s.id === schoolId)?.name ?? "Ukendt skole";
	}

	const filteredClasses = classes?.filter(c => {
		// Event filter
		if (selectedEventId !== null && !c.eventIds?.includes(selectedEventId)) {
			return false;
		}

		// Text search
		const schoolName = getSchoolName(c.schoolId);
		const classEvents = events?.filter(e => c.eventIds?.includes(e.id)) ?? [];
		const eventNames = classEvents.map(e => e.name).join(" ");
		return (
			c.name.toLowerCase().includes(search.toLowerCase()) ||
			schoolName.toLowerCase().includes(search.toLowerCase()) ||
			eventNames.toLowerCase().includes(search.toLowerCase())
		);
	});

	function handleCreated(newClass: ClassModel) {
		setClasses(prev => [...(prev ?? []), newClass]);
		setShowCreateDialog(false);
		router.push(`/admin/classes/${newClass.id}`);
	}

	return (
		<AdminShell pageTitle={"Klasser"} currentPath={"/admin/classes"}>
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
							placeholder={"Søg efter klasse, skole eller begivenhed..."}
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>

					<button
						className={cn(button({shape: "pill"}), "bg-hover text-white border-hover flex items-center gap-2 font-semibold")}
						onClick={() => setShowCreateDialog(true)}
					>
						<span>+</span>
						<span>Opret klasse</span>
					</button>
				</div>

				{/* Table / List */}
				<div className={cn(card(), "bg-white overflow-hidden")}>
					<div className={"grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500"}>
						<span className={"col-span-4"}>Klasse</span>
						<span className={"col-span-3"}>Skole</span>
						<span className={"col-span-3"}>Begivenheder</span>
						<span className={"col-span-2 text-right"}>Hold</span>
					</div>

					<AsyncDataRenderer
						loading={loadingClasses}
						error={errorClasses}
						data={filteredClasses ?? null}
						renderData={classesList => {
							if (classesList.length === 0) {
								return (
									<div className={"p-8 text-center text-gray-400"}>
										{selectedEventId !== null
											? "Ingen klasser fundet for den valgte begivenhed"
											: "Ingen klasser fundet"}
									</div>
								);
							}
							return (
								<div className={"divide-y divide-gray-100"}>
									{classesList.map(cls => {
										const teamCount = teams?.filter(t => t.classId === cls.id).length ?? 0;
										const classEvents = events?.filter(e => cls.eventIds?.includes(e.id)) ?? [];
										return (
											<Link
												key={cls.id}
												href={`/admin/classes/${cls.id}`}
												className={"grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"}
											>
												<span className={"col-span-4 font-semibold text-gray-800"}>
													{cls.name}
												</span>
												<span className={"col-span-3 text-gray-600 text-sm"}>
													{getSchoolName(cls.schoolId)}
												</span>
												<div className={"col-span-3 flex flex-wrap gap-1 items-center"}>
													{classEvents.length === 0 ? (
														<span className={"text-gray-400 text-xs italic"}>Ingen</span>
													) : (
														classEvents.map(ev => (
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
												<div className={"col-span-2 flex justify-end"}>
													<span className={"px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700"}>
														{teamCount} {teamCount === 1 ? "hold" : "hold"}
													</span>
												</div>
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
				<CreateClassDialog
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
