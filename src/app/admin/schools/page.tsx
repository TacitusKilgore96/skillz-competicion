"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {button} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {createSchool, getClasses, getEvents, getSchools} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useState, type FormEvent} from "react";
import card from "@/components/admin/Card";
import {EventSelector} from "@/components/admin/EventSelector";
import {useSelectedEvent} from "@/hooks/useSelectedEvent";

// ── Creation dialog ──────────────────────────────────────────────────────────

interface CreateDialogProps {
	onClose: () => void;
	onCreated: (school: SchoolModel) => void;
}

function CreateSchoolDialog({onClose, onCreated}: CreateDialogProps) {
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!name.trim()) {
			setError("Skolens navn er påkrævet.");
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const created = await createSchool({name: name.trim()});
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
				<h2 className={"text-xl font-bold uppercase"}>Ny skole</h2>

				<form onSubmit={handleSubmit} className={"flex flex-col gap-4"}>
					<div className={"flex flex-col gap-1"}>
						<label className={"text-sm font-semibold text-gray-600 uppercase"}>Navn</label>
						<input
							className={textField()}
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder={"Skolens navn"}
							autoFocus
						/>
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

// ── Schools List Page ────────────────────────────────────────────────────────

export default function SchoolsPage() {
	const {data: schools, loading: loadingSchools, error: errorSchools, setData: setSchools} =
		useAsync<SchoolModel[]>(async () => getSchools(), []);

	const {data: classes} = useAsync<ClassModel[]>(async () => getClasses(), []);
	const {data: events, loading: loadingEvents} = useAsync<EventModel[]>(async () => getEvents(), []);

	const {selectedEventId, setSelectedEventId} = useSelectedEvent();

	const router = useRouter();

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [search, setSearch] = useState("");

	const filteredSchools = schools?.filter(s =>
		s.name.toLowerCase().includes(search.toLowerCase())
	);

	function handleCreated(newSchool: SchoolModel) {
		setSchools(prev => [...(prev ?? []), newSchool]);
		setShowCreateDialog(false);
		router.push(`/admin/schools/${newSchool.id}`);
	}

	return (
		<AdminShell pageTitle={"Skoler"} currentPath={"/admin/schools"}>
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
							placeholder={"Søg efter skole..."}
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>

					<button
						className={cn(button({shape: "pill"}), "bg-hover text-white border-hover flex items-center gap-2 font-semibold")}
						onClick={() => setShowCreateDialog(true)}
					>
						<span>+</span>
						<span>Opret skole</span>
					</button>
				</div>

				{/* Table / List */}
				<div className={cn(card(), "bg-white overflow-hidden")}>
					<div className={"grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500"}>
						<span className={"col-span-7"}>Skolenavn</span>
						<span className={"col-span-5 text-right"}>Klasser</span>
					</div>

					<AsyncDataRenderer
						loading={loadingSchools}
						error={errorSchools}
						data={filteredSchools ?? null}
						renderData={schoolsList => {
							if (schoolsList.length === 0) {
								return (
									<div className={"p-8 text-center text-gray-400"}>
										Ingen skoler fundet
									</div>
								);
							}
							return (
								<div className={"divide-y divide-gray-100"}>
									{schoolsList.map(school => {
										const schoolClasses = classes?.filter(c => c.schoolId === school.id) ?? [];
										const totalCount = schoolClasses.length;
										const eventCount = selectedEventId !== null
											? schoolClasses.filter(c => c.eventIds?.includes(selectedEventId)).length
											: totalCount;

										return (
											<Link
												key={school.id}
												href={`/admin/schools/${school.id}`}
												className={"grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"}
											>
												<span className={"col-span-7 font-semibold text-gray-800"}>
													{school.name}
												</span>
												<div className={"col-span-5 flex justify-end items-center gap-2"}>
													{selectedEventId !== null ? (
														<>
															<span className={cn(
																"px-2.5 py-0.5 rounded-full text-xs font-semibold",
																eventCount > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
															)}>
																{eventCount} {eventCount === 1 ? "klasse" : "klasser"} i begivenhed
															</span>
															<span className={"text-xs text-gray-400"}>
																({totalCount} i alt)
															</span>
														</>
													) : (
														<span className={"px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"}>
															{totalCount} {totalCount === 1 ? "klasse" : "klasser"}
														</span>
													)}
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
				<CreateSchoolDialog
					onClose={() => setShowCreateDialog(false)}
					onCreated={handleCreated}
				/>
			)}
		</AdminShell>
	);
}
