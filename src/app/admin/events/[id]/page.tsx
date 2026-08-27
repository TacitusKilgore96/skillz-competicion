"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {button} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {deleteEvent, getClasses, getEventById, getSchools, getStations, updateEvent} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {use, useState, type FormEvent} from "react";
import card from "@/components/admin/Card";

const STATUS_OPTIONS = ["DRAFT", "READY", "ACTIVE", "DONE"] as const;

function formatToInputDate(dateStr?: string): string {
	if (!dateStr) return "";
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		return dateStr;
	}
	if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
		const [day, month, year] = dateStr.split("-");
		return `${year}-${month}-${day}`;
	}
	const parsed = new Date(dateStr);
	if (!isNaN(parsed.getTime())) {
		return parsed.toISOString().split("T")[0];
	}
	return "";
}

function formatToDisplayDate(dateStr?: string): string {
	if (!dateStr) return "";
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		const [year, month, day] = dateStr.split("-");
		return `${day}-${month}-${year}`;
	}
	return dateStr;
}

// ── Edit Form ────────────────────────────────────────────────────────────────

interface EditFormProps {
	event: EventModel;
	classes: ClassModel[];
	schools: SchoolModel[];
	stations: StationModel[];
	onUpdated: (event: EventModel) => void;
	onDeleted: () => void;
}

function EditForm({event, classes, schools, stations, onUpdated, onDeleted}: EditFormProps) {
	const [name, setName] = useState(event.name);
	const [date, setDate] = useState(formatToInputDate(event.date));
	const [status, setStatus] = useState(event.status);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	const linkedClasses = classes.filter(c => c.eventIds?.includes(event.id));
	const linkedStations = stations.filter(s => s.eventId === event.id);
	const isDirty = name !== event.name || date !== formatToInputDate(event.date) || status !== event.status;

	function getSchoolName(schoolId: number) {
		return schools.find(s => s.id === schoolId)?.name ?? "Ukendt skole";
	}

	async function handleSave(e: FormEvent) {
		e.preventDefault();
		if (!name.trim() || !date.trim()) {
			setSaveError("Navn og dato er påkrævet.");
			return;
		}
		setSaving(true);
		setSaveError(null);
		setSaved(false);
		try {
			const updated = await updateEvent(event.id, {
				name: name.trim(),
				date: formatToDisplayDate(date),
				status
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
		const warning = linkedClasses.length > 0
			? `Er du sikker på at du vil slette "${event.name}"? Begivenheden har ${linkedClasses.length} tilknyttede klasse(r).`
			: `Er du sikker på at du vil slette "${event.name}"?`;

		if (!confirm(warning)) return;
		setDeleting(true);
		try {
			await deleteEvent(event.id);
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
					<span className={"text-xs uppercase font-bold text-gray-400 tracking-wider"}>Begivenhed #{event.id}</span>
					<h2 className={"text-2xl font-bold text-gray-800"}>{event.name}</h2>
				</div>
				<div className={"flex items-center gap-2"}>
					<span className={"px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700"}>
						{linkedClasses.length} {linkedClasses.length === 1 ? "klasse" : "klasser"}
					</span>
					<span className={cn(
						"px-3 py-1 rounded-full text-sm font-semibold uppercase",
						event.status === "ACTIVE" ? "bg-green-100 text-green-700" :
							event.status === "READY" ? "bg-blue-100 text-blue-700" :
								event.status === "DONE" ? "bg-gray-200 text-gray-600" :
									"bg-yellow-100 text-yellow-700"
					)}>
						{event.status}
					</span>
				</div>
			</div>

			<form onSubmit={handleSave} className={"flex flex-col gap-5"}>
				<div className={"flex flex-col gap-1"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>Navn</label>
					<input
						className={textField()}
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder={"Begivenhedens navn"}
					/>
				</div>

				<div className={"flex flex-col gap-1"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>Dato</label>
					<input
						className={textField()}
						type={"date"}
						value={date}
						onChange={e => setDate(e.target.value)}
					/>
				</div>

				<div className={"flex flex-col gap-1"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>Status</label>
					<select
						className={cn(textField(), "cursor-pointer")}
						value={status}
						onChange={e => setStatus(e.target.value)}
					>
						{STATUS_OPTIONS.map(s => (
							<option key={s} value={s}>{s}</option>
						))}
					</select>
				</div>

				<div className={"flex flex-col gap-3"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>
						Tilknyttede klasser ({linkedClasses.length})
					</label>
					{linkedClasses.length === 0 ? (
						<p className={"text-sm text-gray-400 italic"}>Ingen klasser tilknyttet denne begivenhed endnu.</p>
					) : (
						<div className={"flex flex-wrap gap-2"}>
							{linkedClasses.map(cls => (
								<Link
									key={cls.id}
									href={`/admin/classes/${cls.id}`}
									className={cn(button({shape: "pill"}), "text-sm hover:bg-hover hover:text-white flex items-center gap-2")}
								>
									<span>{cls.name}</span>
									<span className={"text-xs opacity-75 font-normal"}>({getSchoolName(cls.schoolId)})</span>
								</Link>
							))}
						</div>
					)}
				</div>

				<div className={"flex flex-col gap-3"}>
					<label className={"text-sm font-semibold text-gray-600 uppercase"}>
						Tilknyttede stationer ({linkedStations.length})
					</label>
					{linkedStations.length === 0 ? (
						<p className={"text-sm text-gray-400 italic"}>Ingen stationer tilknyttet denne begivenhed endnu.</p>
					) : (
						<div className={"flex flex-wrap gap-2"}>
							{linkedStations.map(st => (
								<Link
									key={st.id}
									href={`/admin/stations/${st.id}`}
									className={cn(button({shape: "pill"}), "text-sm hover:bg-hover hover:text-white flex items-center gap-2")}
								>
									<span>🎯 {st.name}</span>
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
						{deleting ? "Sletter..." : "Slet begivenhed"}
					</button>
				</div>
			</form>
		</div>
	);
}

// ── Event Edit Page ──────────────────────────────────────────────────────────

export default function EventDetailPage({params}: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const eventId = parseInt(resolvedParams.id, 10);
	const router = useRouter();

	const {data: event, loading, error, setData} = useAsync<EventModel | undefined>(
		async () => getEventById(eventId),
		[eventId]
	);

	const {data: classes} = useAsync<ClassModel[]>(async () => getClasses(), []);
	const {data: schools} = useAsync<SchoolModel[]>(async () => getSchools(), []);
	const {data: stations} = useAsync<StationModel[]>(async () => getStations(), []);

	function handleUpdated(updated: EventModel) {
		setData(updated);
	}

	function handleDeleted() {
		router.push("/admin/events");
	}

	return (
		<AdminShell pageTitle={"Begivenhed"} currentPath={"/admin/events"}>
			<div className={"p-8 flex flex-col gap-6 max-w-3xl mx-auto w-full"}>
				<div>
					<Link
						href={"/admin/events"}
						className={"text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"}
					>
						← Tilbage til begivenheder
					</Link>
				</div>

				<AsyncDataRenderer
					loading={loading}
					error={error}
					data={event ?? null}
					renderData={eventData => {
						if (!eventData) {
							return (
								<div className={cn(card(), "bg-white p-8 text-center text-gray-500 flex flex-col items-center gap-4")}>
									<p>Begivenheden blev ikke fundet.</p>
									<Link href={"/admin/events"} className={button({shape: "pill"})}>
										Gå til oversigt
									</Link>
								</div>
							);
						}
						return (
							<EditForm
								key={eventData.id}
								event={eventData}
								classes={classes ?? []}
								schools={schools ?? []}
								stations={stations ?? []}
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
