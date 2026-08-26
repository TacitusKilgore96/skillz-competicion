"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {button} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {deleteSchool, getClasses, getEvents, getSchoolById, updateSchool} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {use, useState, type FormEvent} from "react";
import card from "@/components/admin/Card";

// ── Edit Form ────────────────────────────────────────────────────────────────

interface EditFormProps {
	school: SchoolModel;
	classes: ClassModel[];
	events: EventModel[];
	onUpdated: (school: SchoolModel) => void;
	onDeleted: () => void;
}

function EditForm({school, classes, events, onUpdated, onDeleted}: EditFormProps) {
	const [name, setName] = useState(school.name);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	const linkedClasses = classes.filter(c => c.schoolId === school.id);
	const isDirty = name !== school.name;

	function getEventNames(eventIds?: number[]) {
		if (!eventIds || eventIds.length === 0) return "Ingen begivenhed";
		return eventIds.map(id => events.find(e => e.id === id)?.name ?? `Begivenhed #${id}`).join(", ");
	}

	async function handleSave(e: FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setSaveError("Skolens navn er påkrævet.");
			return;
		}
		setSaving(true);
		setSaveError(null);
		setSaved(false);
		try {
			const updated = await updateSchool(school.id, {name: name.trim()});
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
		const warning = linkedClasses.length > 0
			? `Er du sikker på at du vil slette "${school.name}"? Skolen har ${linkedClasses.length} tilknyttede klasse(r).`
			: `Er du sikker på at du vil slette "${school.name}"?`;

		if (!confirm(warning)) return;
		setDeleting(true);
		try {
			await deleteSchool(school.id);
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
					<span className={"text-xs uppercase font-bold text-gray-400 tracking-wider"}>Skole #{school.id}</span>
					<h2 className={"text-2xl font-bold text-gray-800"}>{school.name}</h2>
				</div>
				<span className={"px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700"}>
					{linkedClasses.length} {linkedClasses.length === 1 ? "klasse" : "klasser"}
				</span>
			</div>

			<form onSubmit={handleSave} className={"flex flex-col gap-6"}>
				<div className={"flex flex-col gap-1"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>Navn</label>
					<input
						className={textField()}
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder={"Skolens navn"}
					/>
				</div>

				<div className={"flex flex-col gap-3"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>
						Tilknyttede klasser ({linkedClasses.length})
					</label>
					{linkedClasses.length === 0 ? (
						<p className={"text-sm text-gray-400 italic"}>Ingen klasser tilknyttet denne skole endnu.</p>
					) : (
						<div className={"flex flex-wrap gap-2"}>
							{linkedClasses.map(cls => (
								<Link
									key={cls.id}
									href={`/admin/classes/${cls.id}`}
									className={cn(button({shape: "pill"}), "text-sm hover:bg-hover hover:text-white flex items-center gap-2")}
								>
									<span>{cls.name}</span>
									<span className={"text-xs opacity-75 font-normal"}>({getEventNames(cls.eventIds)})</span>
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
						{deleting ? "Sletter..." : "Slet skole"}
					</button>
				</div>
			</form>
		</div>
	);
}

// ── School Edit Page ─────────────────────────────────────────────────────────

export default function SchoolDetailPage({params}: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const schoolId = parseInt(resolvedParams.id, 10);
	const router = useRouter();

	const {data: school, loading, error, setData} = useAsync<SchoolModel | undefined>(
		async () => getSchoolById(schoolId),
		[schoolId]
	);

	const {data: classes} = useAsync<ClassModel[]>(async () => getClasses(), []);
	const {data: events} = useAsync<EventModel[]>(async () => getEvents(), []);

	function handleUpdated(updated: SchoolModel) {
		setData(updated);
	}

	function handleDeleted() {
		router.push("/admin/schools");
	}

	return (
		<AdminShell pageTitle={"Skole"} currentPath={"/admin/schools"}>
			<div className={"p-8 flex flex-col gap-6 max-w-3xl mx-auto w-full"}>
				<div>
					<Link
						href={"/admin/schools"}
						className={"text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"}
					>
						← Tilbage til skoler
					</Link>
				</div>

				<AsyncDataRenderer
					loading={loading}
					error={error}
					data={school ?? null}
					renderData={schoolData => {
						if (!schoolData) {
							return (
								<div className={cn(card(), "bg-white p-8 text-center text-gray-500 flex flex-col items-center gap-4")}>
									<p>Skolen blev ikke fundet.</p>
									<Link href={"/admin/schools"} className={button({shape: "pill"})}>
										Gå til oversigt
									</Link>
								</div>
							);
						}
						return (
							<EditForm
								key={schoolData.id}
								school={schoolData}
								classes={classes ?? []}
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
