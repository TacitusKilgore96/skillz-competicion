"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {button} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {deleteTeam, getClasses, getEvents, getSchools, getTeamById, updateTeam} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {use, useState, type FormEvent} from "react";
import card from "@/components/admin/Card";

// ── Edit Form ────────────────────────────────────────────────────────────────

interface EditFormProps {
	team: TeamModel;
	classes: ClassModel[];
	schools: SchoolModel[];
	events: EventModel[];
	onUpdated: (team: TeamModel) => void;
	onDeleted: () => void;
}

function EditForm({team, classes, schools, events, onUpdated, onDeleted}: EditFormProps) {
	const [name, setName] = useState(team.name);
	const [classId, setClassId] = useState<number>(team.classId);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	const currentClass = classes.find(c => c.id === classId);
	const currentSchool = currentClass ? schools.find(s => s.id === currentClass.schoolId) : undefined;
	const teamEvents = currentClass ? events.filter(e => currentClass.eventIds?.includes(e.id)) : [];
	const isDirty = name !== team.name || classId !== team.classId;

	function getSchoolName(schoolId: number) {
		return schools.find(s => s.id === schoolId)?.name ?? "Ukendt skole";
	}

	function getEventNames(eventIds?: number[]) {
		if (!eventIds || eventIds.length === 0) return "Ingen begivenhed";
		return eventIds.map(id => events.find(e => e.id === id)?.name ?? `Begivenhed #${id}`).join(", ");
	}

	async function handleSave(e: FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setSaveError("Holdets navn er påkrævet.");
			return;
		}
		if (!classId) {
			setSaveError("Du skal vælge en klasse.");
			return;
		}
		setSaving(true);
		setSaveError(null);
		setSaved(false);
		try {
			const updated = await updateTeam(team.id, {
				name: name.trim(),
				classId: Number(classId)
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
		if (!confirm(`Er du sikker på at du vil slette holdet "${team.name}"?`)) return;
		setDeleting(true);
		try {
			await deleteTeam(team.id);
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
					<span className={"text-xs uppercase font-bold text-gray-400 tracking-wider"}>Hold #{team.id}</span>
					<h2 className={"text-2xl font-bold text-gray-800"}>{team.name}</h2>
				</div>
				<div className={"flex flex-wrap gap-2 items-center"}>
					{teamEvents.map(ev => (
						<Link
							key={ev.id}
							href={`/admin/events/${ev.id}`}
							className={"px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700 hover:underline"}
						>
							📅 {ev.name}
						</Link>
					))}
					{currentClass && (
						<Link
							href={`/admin/classes/${currentClass.id}`}
							className={"px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 hover:underline"}
						>
							{currentClass.name} {currentSchool ? `(${currentSchool.name})` : ""}
						</Link>
					)}
				</div>
			</div>

			<form onSubmit={handleSave} className={"flex flex-col gap-6"}>
				<div className={"flex flex-col gap-1"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>Holdets navn</label>
					<input
						className={textField()}
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder={"Holdets navn"}
					/>
				</div>

				<div className={"flex flex-col gap-1"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>Tilknyttet klasse</label>
					<select
						className={cn(textField(), "cursor-pointer")}
						value={classId}
						onChange={e => setClassId(Number(e.target.value))}
					>
						{classes.map(c => (
							<option key={c.id} value={c.id}>
								{c.name} ({getSchoolName(c.schoolId)}) - {getEventNames(c.eventIds)}
							</option>
						))}
					</select>
				</div>

				{currentClass && (
					<div className={"p-4 bg-gray-50 rounded-xl flex items-center justify-between"}>
						<div>
							<p className={"text-xs text-gray-400 uppercase font-semibold"}>Klassedetaljer</p>
							<p className={"text-sm font-semibold text-gray-700"}>{currentClass.name}</p>
							<p className={"text-xs text-gray-500"}>
								{currentSchool?.name ?? "Ukendt skole"} {teamEvents.length > 0 ? `• Begivenheder: ${teamEvents.map(e => e.name).join(", ")}` : ""}
							</p>
						</div>
						<Link
							href={`/admin/classes/${currentClass.id}`}
							className={cn(button({shape: "pill"}), "text-xs hover:bg-hover hover:text-white")}
						>
							Se klasse →
						</Link>
					</div>
				)}

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
						{deleting ? "Sletter..." : "Slet hold"}
					</button>
				</div>
			</form>
		</div>
	);
}

// ── Team Edit Page ───────────────────────────────────────────────────────────

export default function TeamDetailPage({params}: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const teamId = parseInt(resolvedParams.id, 10);
	const router = useRouter();

	const {data: team, loading, error, setData} = useAsync<TeamModel | undefined>(
		async () => getTeamById(teamId),
		[teamId]
	);

	const {data: classes} = useAsync<ClassModel[]>(async () => getClasses(), []);
	const {data: schools} = useAsync<SchoolModel[]>(async () => getSchools(), []);
	const {data: events} = useAsync<EventModel[]>(async () => getEvents(), []);

	function handleUpdated(updated: TeamModel) {
		setData(updated);
	}

	function handleDeleted() {
		router.push("/admin/teams");
	}

	return (
		<AdminShell pageTitle={"Hold"} currentPath={"/admin/teams"}>
			<div className={"p-8 flex flex-col gap-6 max-w-3xl mx-auto w-full"}>
				<div>
					<Link
						href={"/admin/teams"}
						className={"text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"}
					>
						← Tilbage til hold
					</Link>
				</div>

				<AsyncDataRenderer
					loading={loading}
					error={error}
					data={team ?? null}
					renderData={teamData => {
						if (!teamData) {
							return (
								<div className={cn(card(), "bg-white p-8 text-center text-gray-500 flex flex-col items-center gap-4")}>
									<p>Holdet blev ikke fundet.</p>
									<Link href={"/admin/teams"} className={button({shape: "pill"})}>
										Gå til oversigt
									</Link>
								</div>
							);
						}
						return (
							<EditForm
								key={teamData.id}
								team={teamData}
								classes={classes ?? []}
								schools={schools ?? []}
								events={events ?? []}
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
