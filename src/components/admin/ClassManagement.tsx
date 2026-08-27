"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { cn } from "tailwind-variants";
import {
	IconPlus,
	IconTrash,
	IconEdit,
	IconSearch,
	IconX,
	IconLoader2,
	IconAlertTriangle,
	IconCheck,
	IconSchool,
	IconBuildingCommunity,
	IconUsers,
	IconUser,
	IconArrowRight,
} from "@tabler/icons-react";
import { button, iconButton } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import SchoolSelector from "@/components/admin/SchoolSelector";
import { ClassModel } from "@/models/ClassModel";
import { TeamModel } from "@/models/TeamModel";
import {
	getClasses,
	createClass,
	updateClass,
	deleteClass,
	getTeams,
	getSchools,
} from "@/libs/API";

interface ClassManagementProps {
	initialClassId?: number | null;
	eventId?: string | string[];
}

type ViewMode = "VIEW" | "CREATE" | "EDIT";

export default function ClassManagement({
	initialClassId,
	eventId,
}: ClassManagementProps) {
	const router = useRouter();
	const params = useParams();
	const activeEventId = eventId || params.eventId || "0";
	const numEventId = Number(activeEventId);

	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [schools, setSchools] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);

	const [selectedId, setSelectedId] = useState<number | null>(
		initialClassId !== undefined && initialClassId !== null ? initialClassId : null
	);
	const [viewMode, setViewMode] = useState<ViewMode>("VIEW");
	const [searchQuery, setSearchQuery] = useState("");
	const [schoolFilter, setSchoolFilter] = useState<string>("ALL");

	// Form states
	const [formName, setFormName] = useState("");
	const [formSchool, setFormSchool] = useState("");
	const [formTeacher, setFormTeacher] = useState("");
	const [formTeamsCount, setFormTeamsCount] = useState<number>(4);
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Delete confirmation modal
	const [classToDelete, setClassToDelete] = useState<ClassModel | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Toast notification
	const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

	const [, startTransition] = useTransition();

	const showNotification = (message: string, type: "success" | "error" = "success") => {
		setToast({ message, type });
		setTimeout(() => {
			setToast(null);
		}, 4000);
	};

	const fetchData = async (selectTargetId?: number | null) => {
		setLoading(true);
		try {
			const [classesData, teamsData, schoolsData] = await Promise.all([
				getClasses({ eventId: numEventId }),
				getTeams({ eventId: numEventId }),
				getSchools(numEventId),
			]);
			setClasses(classesData);
			setTeams(teamsData);
			setSchools(schoolsData);

			if (selectTargetId !== undefined && selectTargetId !== null) {
				setSelectedId(selectTargetId);
			} else if (selectedId !== null) {
				const stillExists = classesData.some((c) => c.id === selectedId);
				if (!stillExists) {
					setSelectedId(classesData.length > 0 ? classesData[0].id : null);
				}
			} else if (classesData.length > 0 && initialClassId === undefined) {
				setSelectedId(classesData[0].id);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke hente data";
			showNotification(msg, "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(initialClassId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialClassId, numEventId]);

	const selectedClass = useMemo(() => {
		return classes.find((c) => c.id === selectedId) || null;
	}, [classes, selectedId]);

	// Teams belonging to selected class
	const selectedClassTeams = useMemo(() => {
		if (!selectedClass) return [];
		return teams.filter((t) => t.classId === selectedClass.id);
	}, [teams, selectedClass]);

	// Filtered classes list
	const filteredClasses = useMemo(() => {
		return classes.filter((c) => {
			const matchesSchool = schoolFilter === "ALL" || c.school === schoolFilter;
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				q === "" ||
				c.name.toLowerCase().includes(q) ||
				c.school.toLowerCase().includes(q) ||
				(c.teacherName && c.teacherName.toLowerCase().includes(q));
			return matchesSchool && matchesSearch;
		});
	}, [classes, schoolFilter, searchQuery]);

	// All unique schools from current event classes
	const availableSchools = useMemo(() => {
		const set = new Set<string>();
		classes.forEach((c) => {
			if (c.school?.trim()) set.add(c.school.trim());
		});
		return Array.from(set).sort((a, b) => a.localeCompare(b, "da-DK"));
	}, [classes]);

	const handleSelectClass = (cls: ClassModel) => {
		setSelectedId(cls.id);
		setViewMode("VIEW");
		setFormError(null);
		startTransition(() => {
			router.push(`/admin/${activeEventId}/classes/${cls.id}`);
		});
	};

	const handleStartCreate = () => {
		setViewMode("CREATE");
		setFormName("");
		setFormSchool(availableSchools.length > 0 ? availableSchools[0] : "");
		setFormTeacher("");
		setFormTeamsCount(4);
		setFormError(null);
	};

	const handleStartEdit = (cls: ClassModel) => {
		setSelectedId(cls.id);
		setViewMode("EDIT");
		setFormName(cls.name);
		setFormSchool(cls.school);
		setFormTeacher(cls.teacherName || "");
		setFormError(null);
	};

	const handleCancelForm = () => {
		setViewMode("VIEW");
		setFormError(null);
	};

	const handleSaveForm = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		const trimmedName = formName.trim();
		const trimmedSchool = formSchool.trim();

		if (!trimmedName) {
			setFormError("Indtast venligst et klassenavn (f.eks. 8.A).");
			return;
		}
		if (!trimmedSchool) {
			setFormError("Vælg eller indtast venligst en skole for klassen.");
			return;
		}

		setIsSubmitting(true);
		try {
			if (viewMode === "CREATE") {
				const created = await createClass({
					eventId: numEventId,
					name: trimmedName,
					school: trimmedSchool,
					teacherName: formTeacher.trim() || undefined,
					initialTeamsCount: formTeamsCount,
				});
				await fetchData(created.id);
				setViewMode("VIEW");
				showNotification(`Klassen '${created.name}' fra ${created.school} er oprettet med ${formTeamsCount} hold!`);
				router.push(`/admin/${activeEventId}/classes/${created.id}`);
			} else if (viewMode === "EDIT" && selectedClass) {
				const updated = await updateClass(selectedClass.id, {
					name: trimmedName,
					school: trimmedSchool,
					teacherName: formTeacher.trim() || undefined,
				});
				await fetchData(updated.id);
				setViewMode("VIEW");
				showNotification(`Klassen '${updated.name}' er opdateret!`);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Handlingen mislykkedes";
			setFormError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!classToDelete) return;
		setIsDeleting(true);
		try {
			await deleteClass(classToDelete.id);
			showNotification(`Klassen '${classToDelete.name}' og tilhørende hold/konti er slettet.`);
			setClassToDelete(null);
			const remaining = classes.filter((c) => c.id !== classToDelete.id);
			setClasses(remaining);
			if (selectedId === classToDelete.id) {
				const nextSelected = remaining.length > 0 ? remaining[0].id : null;
				setSelectedId(nextSelected);
				if (nextSelected !== null) {
					router.push(`/admin/${activeEventId}/classes/${nextSelected}`);
				} else {
					router.push(`/admin/${activeEventId}/classes`);
				}
			}
			await fetchData(selectedId === classToDelete.id ? null : selectedId);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke slette klassen";
			showNotification(msg, "error");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex h-full w-full bg-slate-50 relative overflow-hidden">
			{/* Toast notification */}
			{toast && (
				<div
					className={cn(
						"absolute top-4 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200",
						toast.type === "success"
							? "bg-emerald-50 text-emerald-900 border-emerald-300"
							: "bg-red-50 text-red-900 border-red-300"
					)}
				>
					{toast.type === "success" ? (
						<IconCheck size={18} className="text-emerald-600 shrink-0" />
					) : (
						<IconAlertTriangle size={18} className="text-red-600 shrink-0" />
					)}
					<span>{toast.message}</span>
				</div>
			)}

			{/* Left Column: Classes Directory */}
			<aside className="shrink-0 h-full w-96 p-4 border-r border-slate-200 bg-white flex flex-col gap-3">
				{/* Top search & create bar */}
				<div className="flex gap-2 items-center">
					<div className="relative flex-1">
						<IconSearch
							size={18}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
						/>
						<input
							type="search"
							className={cn(textField(), "w-full pl-9 pr-3 py-1.5 text-sm")}
							placeholder="Søg klasse, skole eller lærer..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={handleStartCreate}
						title="Opret ny klasse"
						className={cn(
							iconButton(),
							"bg-hover text-white hover:bg-emerald-600 border-transparent shadow-sm"
						)}
					>
						<IconPlus size={20} />
					</button>
				</div>

				{/* School Filter Chips */}
				{availableSchools.length > 0 && (
					<div className="flex gap-1 overflow-x-auto pb-1 max-w-full text-xs font-semibold scrollbar-thin">
						<button
							onClick={() => setSchoolFilter("ALL")}
							className={cn(
								"px-2.5 py-1 rounded-xl transition-all whitespace-nowrap shrink-0",
								schoolFilter === "ALL"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-100 text-slate-600 hover:bg-slate-200"
							)}
						>
							Alle skoler ({classes.length})
						</button>
						{availableSchools.map((s) => {
							const count = classes.filter((c) => c.school === s).length;
							return (
								<button
									key={s}
									onClick={() => setSchoolFilter(s)}
									className={cn(
										"px-2.5 py-1 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1",
										schoolFilter === s
											? "bg-slate-900 text-white shadow-xs"
											: "bg-slate-100 text-slate-600 hover:bg-slate-200"
									)}
								>
									<IconBuildingCommunity size={12} />
									<span>{s}</span>
									<span className="opacity-70 text-[10px]">({count})</span>
								</button>
							);
						})}
					</div>
				)}

				{/* Classes List */}
				<div className="flex-1 overflow-y-auto pr-1">
					{loading ? (
						<div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
							<IconLoader2 size={24} className="animate-spin" />
							<p className="text-sm">Henter klasser...</p>
						</div>
					) : filteredClasses.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4 text-center">
							<IconSchool size={32} className="mb-2 opacity-40" />
							<p className="text-sm font-medium">Ingen klasser fundet</p>
							<p className="text-xs text-slate-400 mt-1">
								{classes.length === 0
									? "Der er endnu ikke oprettet klasser til dette event."
									: "Prøv en anden søgning eller filter."}
							</p>
							<button
								onClick={handleStartCreate}
								className={cn(button(), "mt-3 text-xs flex items-center gap-1")}
							>
								<IconPlus size={14} /> Opret klasse
							</button>
						</div>
					) : (
						<ul className="flex flex-col gap-2">
							{filteredClasses.map((cls) => {
								const isSelected = selectedId === cls.id && viewMode !== "CREATE";
								const classTeamCount = teams.filter((t) => t.classId === cls.id).length;

								return (
									<li key={cls.id}>
										<button
											type="button"
											onClick={() => handleSelectClass(cls)}
											className={cn(
												"w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center justify-between group",
												isSelected
													? "bg-slate-800 text-white border-slate-800 shadow-md"
													: "bg-white border-slate-200 hover:border-slate-400 text-slate-800"
											)}
										>
											<div className="flex items-center gap-3 min-w-0">
												<div
													className={cn(
														"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm",
														isSelected
															? "bg-emerald-500/20 text-emerald-300"
															: "bg-slate-100 text-slate-700"
													)}
												>
													<IconSchool size={20} />
												</div>
												<div className="min-w-0">
													<div className="font-bold text-sm truncate flex items-center gap-2">
														<span>{cls.name}</span>
														<span
															className={cn(
																"text-[11px] font-normal px-2 py-0.5 rounded-full inline-block truncate",
																isSelected
																	? "bg-white/10 text-slate-300"
																	: "bg-slate-100 text-slate-600"
															)}
														>
															{cls.school}
														</span>
													</div>
													<div className="flex items-center gap-2 mt-0.5 text-xs opacity-75">
														{cls.teacherName && (
															<span className="truncate">Lærer: {cls.teacherName}</span>
														)}
														<span
															className={cn(
																"text-[10px] font-semibold px-1.5 py-0.2 rounded-md ml-auto",
																isSelected
																	? "bg-emerald-400/20 text-emerald-200"
																	: "bg-emerald-50 text-emerald-700"
															)}
														>
															{classTeamCount} hold
														</span>
													</div>
												</div>
											</div>

											<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<span
													role="button"
													title="Rediger"
													onClick={(e) => {
														e.stopPropagation();
														handleStartEdit(cls);
													}}
													className={cn(
														"p-1.5 rounded-lg transition-colors cursor-pointer",
														isSelected
															? "hover:bg-white/20 text-white"
															: "hover:bg-slate-100 text-slate-500"
													)}
												>
													<IconEdit size={16} />
												</span>
												<span
													role="button"
													title="Slet"
													onClick={(e) => {
														e.stopPropagation();
														setClassToDelete(cls);
													}}
													className={cn(
														"p-1.5 rounded-lg transition-colors cursor-pointer",
														isSelected
															? "hover:bg-red-500/40 text-red-200"
															: "hover:bg-red-50 text-red-500"
													)}
												>
													<IconTrash size={16} />
												</span>
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</aside>

			{/* Right Column: Work Area */}
			<div className="flex-1 h-full overflow-y-auto p-8">
				{viewMode === "CREATE" ? (
					/* Create Class Form */
					<div className="max-w-2xl mx-auto">
						<div className={cn(card(), "bg-white p-8 shadow-sm")}>
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-2xl font-bold text-slate-800">Opret ny klasse</h2>
									<p className="text-sm text-slate-500 mt-1">
										Opret en skoleklasse tilknyttet det aktuelle event.
									</p>
								</div>
								<button
									onClick={handleCancelForm}
									className={cn(iconButton(), "text-slate-400 hover:text-slate-600")}
								>
									<IconX size={20} />
								</button>
							</div>

							{formError && (
								<div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
									<IconAlertTriangle size={18} className="shrink-0" />
									<span>{formError}</span>
								</div>
							)}

							<form onSubmit={handleSaveForm} className="space-y-6">
								{/* Class Name */}
								<div>
									<label
										htmlFor="new-class-name"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Klassenavn *
									</label>
									<input
										id="new-class-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2.5 px-4 text-sm")}
										placeholder="f.eks. 8.A eller 10. Teknisk"
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* School with Autocomplete Selection Box */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<label
											htmlFor="new-class-school"
											className="block text-xs font-bold uppercase tracking-wider text-slate-600"
										>
											Skole *
										</label>
										<span className="text-xs text-slate-400">
											Vælg fra listen eller skriv en ny
										</span>
									</div>
									<SchoolSelector
										value={formSchool}
										onChange={setFormSchool}
										existingSchools={schools}
										required
										placeholder="Indtast skolenavn eller vælg eksisterende..."
									/>
								</div>

								{/* Teacher Name */}
								<div>
									<label
										htmlFor="new-class-teacher"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Lærer / Kontaktperson (valgfri)
									</label>
									<div className="relative flex items-center">
										<IconUser size={18} className="absolute left-3.5 text-slate-400" />
										<input
											id="new-class-teacher"
											type="text"
											className={cn(textField(), "w-full pl-10 pr-4 py-2.5 text-sm")}
											placeholder="f.eks. Flemming Jensen"
											value={formTeacher}
											onChange={(e) => setFormTeacher(e.target.value)}
										/>
									</div>
								</div>

								{/* Initial Teams Count */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<label
											htmlFor="new-class-teams-count"
											className="block text-xs font-bold uppercase tracking-wider text-slate-600"
										>
											Antal hold der oprettes automatisk
										</label>
										<span className="text-xs text-slate-400 font-medium">
											Gemmes ikke på klassen
										</span>
									</div>
									<div className="relative flex items-center">
										<IconUsers size={18} className="absolute left-3.5 text-slate-400" />
										<input
											id="new-class-teams-count"
											type="number"
											min={0}
											max={20}
											className={cn(textField(), "w-full pl-10 pr-4 py-2.5 text-sm font-semibold")}
											placeholder="4"
											value={formTeamsCount}
											onChange={(e) =>
												setFormTeamsCount(Math.max(0, parseInt(e.target.value) || 0))
											}
										/>
									</div>
									<p className="text-xs text-slate-500 mt-1.5">
										Der oprettes automatisk det valgte antal hold med tilknyttede delte logins. Holdene kan tilpasses eller oprettes manuelt senere.
									</p>
								</div>

								{/* Actions */}
								<div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
									<button
										type="button"
										onClick={handleCancelForm}
										className={cn(
											button(),
											"px-5 py-2 text-sm text-slate-600 hover:text-slate-900 border-slate-200"
										)}
									>
										Annuller
									</button>
									<button
										type="submit"
										disabled={isSubmitting}
										className={cn(
											button(),
											"px-6 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border-transparent shadow-sm flex items-center gap-2"
										)}
									>
										{isSubmitting && <IconLoader2 size={16} className="animate-spin" />}
										<span>Opret Klasse</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				) : viewMode === "EDIT" && selectedClass ? (
					/* Edit Class Form */
					<div className="max-w-2xl mx-auto">
						<div className={cn(card(), "bg-white p-8 shadow-sm")}>
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-2xl font-bold text-slate-800">Rediger klasse</h2>
									<p className="text-sm text-slate-500 mt-1">
										Opdater klasseoplysninger for {selectedClass.name}.
									</p>
								</div>
								<button
									onClick={handleCancelForm}
									className={cn(iconButton(), "text-slate-400 hover:text-slate-600")}
								>
									<IconX size={20} />
								</button>
							</div>

							{formError && (
								<div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
									<IconAlertTriangle size={18} className="shrink-0" />
									<span>{formError}</span>
								</div>
							)}

							<form onSubmit={handleSaveForm} className="space-y-6">
								{/* Class Name */}
								<div>
									<label
										htmlFor="edit-class-name"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Klassenavn *
									</label>
									<input
										id="edit-class-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2.5 px-4 text-sm")}
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* School with Autocomplete Selection Box */}
								<div>
									<div className="flex items-center justify-between mb-2">
										<label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
											Skole *
										</label>
										<span className="text-xs text-slate-400">
											Vælg fra listen eller skriv en ny
										</span>
									</div>
									<SchoolSelector
										value={formSchool}
										onChange={setFormSchool}
										existingSchools={schools}
										required
										placeholder="Indtast skolenavn eller vælg eksisterende..."
									/>
								</div>

								{/* Teacher Name */}
								<div>
									<label
										htmlFor="edit-class-teacher"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Lærer / Kontaktperson (valgfri)
									</label>
									<div className="relative flex items-center">
										<IconUser size={18} className="absolute left-3.5 text-slate-400" />
										<input
											id="edit-class-teacher"
											type="text"
											className={cn(textField(), "w-full pl-10 pr-4 py-2.5 text-sm")}
											value={formTeacher}
											onChange={(e) => setFormTeacher(e.target.value)}
										/>
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
									<button
										type="button"
										onClick={handleCancelForm}
										className={cn(
											button(),
											"px-5 py-2 text-sm text-slate-600 hover:text-slate-900 border-slate-200"
										)}
									>
										Annuller
									</button>
									<button
										type="submit"
										disabled={isSubmitting}
										className={cn(
											button(),
											"px-6 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border-transparent shadow-sm flex items-center gap-2"
										)}
									>
										{isSubmitting && <IconLoader2 size={16} className="animate-spin" />}
										<span>Gem Ændringer</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				) : selectedClass ? (
					/* View Class Details */
					<div className="max-w-2xl mx-auto space-y-6">
						{/* Class Header Card */}
						<div className={cn(card(), "bg-white p-6 shadow-sm")}>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-inner">
										<IconSchool size={32} />
									</div>
									<div>
										<div className="flex items-center gap-2.5">
											<h2 className="text-2xl font-bold text-slate-900">
												{selectedClass.name}
											</h2>
											<span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
												<IconBuildingCommunity size={14} />
												{selectedClass.school}
											</span>
										</div>
										<p className="text-xs text-slate-400 mt-1 font-mono">
											Klasse ID #{selectedClass.id} · Event #{activeEventId}
										</p>
									</div>
								</div>

								{/* Action buttons */}
								<div className="flex items-center gap-2">
									<button
										onClick={() => handleStartEdit(selectedClass)}
										className={cn(
											button(),
											"px-4 py-1.5 text-sm font-semibold flex items-center gap-1.5 hover:border-slate-800"
										)}
									>
										<IconEdit size={16} /> Rediger
									</button>
									<button
										onClick={() => setClassToDelete(selectedClass)}
										className={cn(
											button(),
											"px-4 py-1.5 text-sm font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400 flex items-center gap-1.5"
										)}
									>
										<IconTrash size={16} /> Slet
									</button>
								</div>
							</div>
						</div>

						{/* Class Information Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className={cn(card(), "bg-white p-5 shadow-sm space-y-2")}>
								<div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
									Tilknyttet Skole
								</div>
								<div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
									<IconBuildingCommunity size={20} className="text-emerald-600" />
									<span>{selectedClass.school}</span>
								</div>
							</div>

							<div className={cn(card(), "bg-white p-5 shadow-sm space-y-2")}>
								<div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
									Lærer / Kontaktperson
								</div>
								<div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
									<IconUser size={20} className="text-indigo-600" />
									<span>{selectedClass.teacherName || "Ikke angivet"}</span>
								</div>
							</div>
						</div>

						{/* Teams in this class */}
						<div className={cn(card(), "bg-white p-6 shadow-sm space-y-4")}>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
										<IconUsers size={18} className="text-emerald-600" />
										<span>Tilmeldte Hold ({selectedClassTeams.length})</span>
									</h3>
									<p className="text-xs text-slate-400 mt-0.5">
										Hold der er oprettet for denne klasse
									</p>
								</div>
								<Link
									href={`/admin/${activeEventId}/teams?createWithClassId=${selectedClass.id}`}
									className={cn(
										button(),
										"text-xs font-semibold flex items-center gap-1 bg-slate-900 text-white border-transparent hover:bg-slate-800"
									)}
								>
									<IconPlus size={14} /> Nyt hold
								</Link>
							</div>

							{selectedClassTeams.length === 0 ? (
								<div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-400 text-sm">
									<IconUsers size={28} className="mx-auto mb-2 opacity-40" />
									<p className="font-medium text-slate-600">Ingen hold oprettet endnu</p>
									<p className="text-xs mt-1">
										Opdel eleverne fra {selectedClass.name} i hold for at deltage i konkurrencen.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{selectedClassTeams.map((team) => (
										<Link
											key={team.id}
											href={`/admin/${activeEventId}/teams/${team.id}`}
											className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-between group"
										>
											<div className="min-w-0">
												<div className="font-semibold text-sm text-slate-800 group-hover:text-emerald-700 truncate">
													{team.name}
												</div>
												<div className="text-xs text-slate-400 mt-0.5">
													{"Hold ID #" + team.id}
													{team.isConfigured === false && " · (Afventer login opsætning)"}
												</div>
											</div>
											<IconArrowRight
												size={16}
												className="text-slate-400 group-hover:text-slate-800 transition-transform group-hover:translate-x-0.5"
											/>
										</Link>
									))}
								</div>
							)}
						</div>
					</div>
				) : (
					/* Empty state */
					<div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
						<div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
							<IconSchool size={36} />
						</div>
						<h3 className="text-xl font-bold text-slate-800">Ingen klasse valgt</h3>
						<p className="text-sm text-slate-500 mt-2 mb-6">
							Vælg en klasse fra listen til venstre for at administrere den, eller opret en ny klasse.
						</p>
						<button
							onClick={handleStartCreate}
							className={cn(
								button(),
								"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-6 py-2 font-bold flex items-center gap-2"
							)}
						>
							<IconPlus size={18} /> Opret ny klasse
						</button>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{classToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
					<div className={cn(card(), "bg-white p-6 max-w-md w-full shadow-2xl space-y-4")}>
						<div className="flex items-center gap-3 text-red-600">
							<div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
								<IconTrash size={22} />
							</div>
							<div>
								<h3 className="font-bold text-lg text-slate-900">Slet klasse</h3>
								<p className="text-xs text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-sm text-slate-600">
							Er du sikker på, at du vil slette klassen{" "}
							<span className="font-bold text-slate-900">&quot;{classToDelete.name}&quot;</span> ({classToDelete.school})?
						</p>

						<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
							<IconAlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
							<span>
								<strong>Bemærk:</strong> Alle tilknyttede hold og deres delte login-konti til denne klasse vil automatisk også blive slettet!
							</span>
						</div>

						<div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeleting}
								onClick={() => setClassToDelete(null)}
								className={cn(
									button(),
									"px-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 border-slate-200"
								)}
							>
								Annuller
							</button>
							<button
								type="button"
								disabled={isDeleting}
								onClick={handleDeleteConfirm}
								className={cn(
									button(),
									"px-5 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 border-transparent shadow-sm flex items-center gap-2"
								)}
							>
								{isDeleting && <IconLoader2 size={16} className="animate-spin" />}
								<span>Slet klasse</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
