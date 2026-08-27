"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {button} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {createEvent, getEvents} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useState, type FormEvent} from "react";
import card from "@/components/admin/Card";

const STATUS_OPTIONS = ["DRAFT", "READY", "ACTIVE", "DONE"] as const;

function formatToDisplayDate(dateStr?: string): string {
	if (!dateStr) return "";
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		const [year, month, day] = dateStr.split("-");
		return `${day}-${month}-${year}`;
	}
	return dateStr;
}

// ── Creation dialog ──────────────────────────────────────────────────────────

interface CreateDialogProps {
	onClose: () => void;
	onCreated: (event: EventModel) => void;
}

function CreateEventDialog({onClose, onCreated}: CreateDialogProps) {
	const [name, setName] = useState("");
	const [date, setDate] = useState("");
	const [status, setStatus] = useState<string>("DRAFT");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!name.trim() || !date.trim()) {
			setError("Navn og dato er påkrævet.");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const created = await createEvent({name: name.trim(), date: formatToDisplayDate(date), status});
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
				<h2 className={"text-xl font-bold uppercase"}>Ny begivenhed</h2>

				<form onSubmit={handleSubmit} className={"flex flex-col gap-4"}>
					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>Navn</label>
						<input
							className={textField()}
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder={"Begivenhedens navn"}
							autoFocus
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

					{error && <p className={"text-red-500 text-sm"}>{error}</p>}

					<div className={"flex gap-2 justify-end pt-2"}>
						<button type={"button"} className={button({shape: "pill"})} onClick={onClose}
						        disabled={saving}>
							Annuller
						</button>
						<button type={"submit"}
						        className={cn(button({shape: "pill"}), "bg-hover text-white border-hover")}
						        disabled={saving}>
							{saving ? "Opretter..." : "Opret"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

// ── Events List Page ─────────────────────────────────────────────────────────

export default function EventsPage() {
	const {data, loading, error, setData} = useAsync<EventModel[]>(async () => getEvents(), []);
	const router = useRouter();

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [search, setSearch] = useState("");

	const filteredEvents = data?.filter(e =>
		e.name.toLowerCase().includes(search.toLowerCase())
	);

	function handleCreated(newEvent: EventModel) {
		setData(prev => [...(prev ?? []), newEvent]);
		setShowCreateDialog(false);
		router.push(`/admin/events/${newEvent.id}`);
	}

	return (
		<AdminShell pageTitle={"Begivenheder"} currentPath={"/admin/events"}>
			<div className={"p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full"}>
				{/* Top Bar */}
				<div className={"flex items-center justify-between gap-4"}>
					<div className={"flex-1 max-w-md"}>
						<input
							className={textField()}
							placeholder={"Søg efter begivenhed..."}
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>

					<button
						className={cn(button({shape: "pill"}), "bg-hover text-white border-hover flex items-center gap-2 font-semibold")}
						onClick={() => setShowCreateDialog(true)}
					>
						<span>+</span>
						<span>Opret begivenhed</span>
					</button>
				</div>

				{/* Table / List */}
				<div className={cn(card(), "bg-white overflow-hidden")}>
					<div className={"grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500"}>
						<span className={"col-span-6"}>Navn</span>
						<span className={"col-span-3"}>Dato</span>
						<span className={"col-span-3 text-right"}>Status</span>
					</div>

					<AsyncDataRenderer
						loading={loading}
						error={error}
						data={filteredEvents ?? null}
						renderData={events => {
							if (events.length === 0) {
								return (
									<div className={"p-8 text-center text-gray-400"}>
										Ingen begivenheder fundet
									</div>
								);
							}
							return (
								<div className={"divide-y divide-gray-100"}>
									{events.map(event => (
										<Link
											key={event.id}
											href={`/admin/events/${event.id}`}
											className={"grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"}
										>
											<span className={"col-span-6 font-semibold text-gray-800"}>
												{event.name}
											</span>
											<span className={"col-span-3 text-gray-600 text-sm"}>
												{formatToDisplayDate(event.date)}
											</span>
											<div className={"col-span-3 flex justify-end"}>
												<span className={cn(
													"px-3 py-0.5 rounded-full text-xs font-semibold uppercase",
													event.status === "ACTIVE" ? "bg-green-100 text-green-700" :
														event.status === "READY" ? "bg-blue-100 text-blue-700" :
															event.status === "DONE" ? "bg-gray-200 text-gray-600" :
																"bg-yellow-100 text-yellow-700"
												)}>
													{event.status}
												</span>
											</div>
										</Link>
									))}
								</div>
							);
						}}
					/>
				</div>
			</div>

			{showCreateDialog && (
				<CreateEventDialog
					onClose={() => setShowCreateDialog(false)}
					onCreated={handleCreated}
				/>
			)}
		</AdminShell>
	);
}
