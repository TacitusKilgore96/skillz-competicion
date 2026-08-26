"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {button} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {deleteClass, getClassById, getEvents, getSchools, getTeams, updateClass} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {use, useState, type FormEvent} from "react";
import card from "@/components/admin/Card";

// ── Edit Form ────────────────────────────────────────────────────────────────

interface EditFormProps {
	cls: ClassModel;
	schools: SchoolModel[];
	events: EventModel[];
	teams: TeamModel[];
	onUpdated: (cls: ClassModel) => void;
	onDeleted: () => void;
}

function arraysEqual(a: number[], b: number[]) {
	if (a.length !== b.length) return false;
	const sortedA = [...a].sort((x, y) => x - y);
	const sortedB = [...b].sort((x, y) => x - y);
	return sortedA.every((val, idx) => val === sortedB[idx]);
}

function EditForm({cls, schools, events, teams, onUpdated, onDeleted}: EditFormProps) {
	const [name, setName] = useState(cls.name);
	const [schoolId, setSchoolId] = useState<number>(cls.schoolId);
	const [eventIds, setEventIds] = useState<number[]>(cls.eventIds ?? []);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	const linkedTeams = teams.filter(t => t.classId === cls.id);
	const currentSchool = schools.find(s => s.id === schoolId);
	const currentEvents = events.filter(e => eventIds.includes(e.id));
	const isDirty = name !== cls.name || schoolId !== cls.schoolId || !arraysEqual(eventIds, cls.eventIds ?? []);

	async function handleSave(e: FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setSaveError("Klassens navn er påkrævet.");
			return;
		}
		if (!schoolId) {
			setSaveError("Du skal vælge en skole.");
			return;
		}
		if (eventIds.length === 0) {
			setSaveError("Du skal vælge mindst én begivenhed.");
			return;
		}
		setSaving(true);
		setSaveError(null);
		setSaved(false);
		try {
			const updated = await updateClass(cls.id, {
				name: name.trim(),
				schoolId: Number(schoolId),
				eventIds: eventIds.map(Number)
			});
			onUpdated(updated);
			setSaved(true);
			setTimeout(() => setSaved(false), 2000);
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : "Noget gik galt.");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		const warning = linkedTeams.length > 0
			? `Er du sikker på at du vil slette "${cls.name}"? Klassen har ${linkedTeams.length} tilknyttede hold.`
			: `Er du sikker på at du vil slette "${cls.name}"?`;

		if (!confirm(warning)) return;
		setDeleting(true);
		try {
			await deleteClass(cls.id);
			onDeleted();
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : "Sletning fejlede.");
			setDeleting(false);
		}
	}

	return (
		<div className={cn(card(), "bg-white p-8 flex flex-col gap-6 shadow-sm")}>
			<div className={"flex items-center justify-between pb-4 border-b border-gray-200"}>
				<div>
					<span className={"text-xs uppercase font-bold text-gray-400 tracking-wider"}>Klasse #{cls.id}</span>
					<h2 className={"text-2xl font-bold text-gray-800"}>{cls.name}</h2>
				</div>
				<div className={"flex flex-wrap gap-2 items-center"}>
					{currentEvents.map(ev => (
						<Link
							key={ev.id}
							href={`/admin/events/${ev.id}`}
							className={"px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 hover:underline"}
						>
							📅 {ev.name}
						</Link>
					))}
					{currentSchool && (
						<Link
							href={`/admin/schools/${currentSchool.id}`}
							className={"px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 hover:underline"}
						>
							🏫 {currentSchool.name}
						</Link>
					)}
				</div>
			</div>

			<form onSubmit={handleSave} className={"flex flex-col gap-6"}>
				<div className={"flex flex-col gap-1"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>Klassens navn</label>
					<input
						className={textField()}
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder={"Klassens navn"}
					/>
				</div>

				<div className={"flex flex-col gap-1.5"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase flex items-center justify-between"}>
						<span>Tilknyttede begivenheder</span>
						{eventIds.length > 0 && (
							<span className={"text-blue-600 font-normal text-xs lowercase"}>
								({eventIds.length} valgt)
							</span>
						)}
					</label>
					{events.length === 0 ? (
						<p className={"text-sm text-gray-400 italic"}>Ingen begivenheder oprettet endnu</p>
					) : (
						<div className={"flex flex-col gap-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50/50"}>
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
												onChange={() => {
													setEventIds(prev =>
														prev.includes(ev.id) ? prev.filter(id => id !== ev.id) : [...prev, ev.id]
													);
												}}
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
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>Tilknyttet skole</label>
					<select
						className={cn(textField(), "cursor-pointer")}
						value={schoolId}
						onChange={e => setSchoolId(Number(e.target.value))}
					>
						{schools.map(s => (
							<option key={s.id} value={s.id}>{s.name}</option>
						))}
					</select>
				</div>

				<div className={"flex flex-col gap-3"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>
						Tilknyttede hold ({linkedTeams.length})
					</label>
					{linkedTeams.length === 0 ? (
						<p className={"text-sm text-gray-400 italic"}>Ingen hold tilknyttet denne klasse endnu.</p>
					) : (
						<div className={"flex flex-wrap gap-2"}>
							{linkedTeams.map(team => (
								<Link
									key={team.id}
									href={`/admin/teams/${team.id}`}
									className={cn(button({shape: "pill"}), "text-sm hover:bg-hover hover:text-white")}
								>
									{team.name}
								</Link>
							))}
						</div>
					)}
				</div>

				{saveError && <p className={"text-red-500 text-sm"}>{saveError}</p>}
				{saved && <p className={"text-green-600 text-sm"}>Ændringerne er gemt!</p>}

				<div className={"flex gap-3 pt-4 border-t border-gray-100 justify-between items-center"}>
					<button
						type={"submit"}
						className={cn(button({shape: "pill"}), "bg-hover text-white border-hover font-semibold")}
						disabled={saving || !isDirty}
					>
						{saving ? "Gemmer..." : "Gem ændringer"}
					</button>

					<button
						type={"button"}
						className={cn(button({shape: "pill"}), "border-red-300 text-red-500 hover:border-red-500")}
						onClick={handleDelete}
						disabled={deleting}
					>
						{deleting ? "Sletter..." : "Slet klasse"}
					</button>
				</div>
			</form>
		</div>
	);
}

// ── Class Edit Page ──────────────────────────────────────────────────────────

export default function ClassDetailPage({params}: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const classId = parseInt(resolvedParams.id, 10);
	const router = useRouter();

	const {data: cls, loading, error, setData} = useAsync<ClassModel | undefined>(
		async () => getClassById(classId),
		[classId]
	);

	const {data: schools} = useAsync<SchoolModel[]>(async () => getSchools(), []);
	const {data: events} = useAsync<EventModel[]>(async () => getEvents(), []);
	const {data: teams} = useAsync<TeamModel[]>(async () => getTeams(), []);

	function handleUpdated(updated: ClassModel) {
		setData(updated);
	}

	function handleDeleted() {
		router.push("/admin/classes");
	}

	return (
		<AdminShell pageTitle={"Klasse"} currentPath={"/admin/classes"}>
			<div className={"p-8 flex flex-col gap-6 max-w-3xl mx-auto w-full"}>
				<div>
					<Link
						href={"/admin/classes"}
						className={"text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"}
					>
						← Tilbage til klasser
					</Link>
				</div>

				<AsyncDataRenderer
					loading={loading}
					error={error}
					data={cls ?? null}
					renderData={classData => {
						if (!classData) {
							return (
								<div className={cn(card(), "bg-white p-8 text-center text-gray-500 flex flex-col items-center gap-4")}>
									<p>Klassen blev ikke fundet.</p>
									<Link href={"/admin/classes"} className={button({shape: "pill"})}>
										Gå til oversigt
									</Link>
								</div>
							);
						}
						return (
							<EditForm
								key={classData.id}
								cls={classData}
								schools={schools ?? []}
								events={events ?? []}
								teams={teams ?? []}
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
