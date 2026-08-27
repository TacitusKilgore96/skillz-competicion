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
	IconSchool,
	IconBuildingCommunity,
	IconUser,
	IconUsers,
	IconLoader2,
	IconAlertTriangle,
	IconCheck,
	IconSparkles,
} from "@tabler/icons-react";
import { button, iconButton } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import SchoolSelector from "@/components/admin/SchoolSelector";
import {
	ClassModel,
	CreateClassDTO,
	UpdateClassDTO,
} from "@/models/ClassModel";
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
	const [formTeacherName, setFormTeacherName] = useState("");
	const [formTeamCount, setFormTeamCount] = useState<number>(3);
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
		}, 3500);
	};

	const fetchData = async (selectTargetId?: number | null) => {
		setLoading(true);
		try {
			const [classesData, teamsData, schoolsData] = await Promise.all([
				getClasses({ eventId: numEventId }),
				getTeams({ eventId: numEventId }),
				getSchools(),
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
			const msg = err instanceof Error ? err.message : "Kunne ikke hente klassedata";
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

	const selectedClassTeams = useMemo(() => {
		if (!selectedClass) return [];
		return teams.filter((t) => t.classId === selectedClass.id);
	}, [teams, selectedClass]);

	// Unique list of schools from current classes
	const availableSchools = useMemo(() => {
		const set = new Set<string>();
		classes.forEach((c) => {
			if (c.school) set.add(c.school);
		});
		return Array.from(set).sort();
	}, [classes]);

	// Filtered classes list
	const filteredClasses = useMemo(() => {
		return classes.filter((cls) => {
			const matchesSchool =
				schoolFilter === "ALL" ? true : cls.school === schoolFilter;
			const q = searchQuery.toLowerCase().trim();
			const matchesQuery =
				q === "" ||
				cls.name.toLowerCase().includes(q) ||
				cls.school.toLowerCase().includes(q) ||
				(cls.teacherName && cls.teacherName.toLowerCase().includes(q));
			return matchesSchool && matchesQuery;
		});
	}, [classes, schoolFilter, searchQuery]);

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
		setFormSchool("");
		setFormTeacherName("");
		setFormTeamCount(3);
		setFormError(null);
	};

	const handleStartEdit = (cls: ClassModel) => {
		setSelectedId(cls.id);
		setViewMode("EDIT");
		setFormName(cls.name);
		setFormSchool(cls.school);
		setFormTeacherName(cls.teacherName || "");
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
			setFormError("Klassenavn er påkrævet");
			return;
		}
		if (!trimmedSchool) {
			setFormError("Skole er påkrævet");
			return;
		}

		setIsSubmitting(true);
		try {
			if (viewMode === "CREATE") {
				const dto: CreateClassDTO = {
					eventId: numEventId,
					name: trimmedName,
					school: trimmedSchool,
					teacherName: formTeacherName.trim() || undefined,
					teamCount: formTeamCount > 0 ? formTeamCount : 1,
				};
				const created = await createClass(dto);
				await fetchData(created.id);
				setViewMode("VIEW");
				showNotification(
					`Klassen '${created.name}' er oprettet med ${formTeamCount} autogenererede hold!`
				);
				router.push(`/admin/${activeEventId}/classes/${created.id}`);
			} else if (viewMode === "EDIT" && selectedClass) {
				const dto: UpdateClassDTO = {
					name: trimmedName,
					school: trimmedSchool,
					teacherName: formTeacherName.trim() || undefined,
				};
				const updated = await updateClass(selectedClass.id, dto);
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
			showNotification(`Klassen '${classToDelete.name}' og dens hold er slettet.`);
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
						"absolute top-4 right-4 z-50 px-3.5 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150",
						toast.type === "success"
							? "bg-slate-900 text-white border-slate-800"
							: "bg-red-50 text-red-900 border-red-200"
					)}
				>
					{toast.type === "success" ? (
						<IconCheck size={16} className="text-emerald-400 shrink-0" />
					) : (
						<IconAlertTriangle size={16} className="text-red-600 shrink-0" />
					)}
					<span>{toast.message}</span>
				</div>
			)}

			{/* Left Column: Classes Directory */}
			<aside className="shrink-0 h-full w-80 p-3.5 border-r border-slate-200 bg-white flex flex-col gap-2.5">
				{/* Top search & create bar */}
				<div className="flex gap-2 items-center">
					<div className="relative flex-1">
						<IconSearch
							size={16}
							className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
						/>
						<input
							type="search"
							className={cn(textField(), "w-full pl-8 pr-2.5 py-1.5 text-xs")}
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
							"bg-slate-900 text-white hover:bg-slate-800 border-transparent p-1.5"
						)}
					>
						<IconPlus size={18} />
					</button>
				</div>

				{/* School Filter Chips */}
				{availableSchools.length > 0 && (
					<div className="flex gap-1 overflow-x-auto pb-1 max-w-full text-xs font-medium scrollbar-thin">
						<button
							onClick={() => setSchoolFilter("ALL")}
							className={cn(
								"px-2 py-0.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs border",
								schoolFilter === "ALL"
									? "bg-slate-900 text-white border-slate-900"
									: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
							)}
						>
							Alle ({classes.length})
						</button>
						{availableSchools.map((s) => {
							const count = classes.filter((c) => c.school === s).length;
							return (
								<button
									key={s}
									onClick={() => setSchoolFilter(s)}
									className={cn(
										"px-2 py-0.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-xs border",
										schoolFilter === s
											? "bg-slate-900 text-white border-slate-900"
											: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
									)}
								>
									<IconBuildingCommunity size={11} />
									<span>{s}</span>
									<span className="opacity-60 text-[10px]">({count})</span>
								</button>
							);
						})}
					</div>
				)}

				{/* Classes List */}
				<div className="flex-1 overflow-y-auto pr-0.5">
					{loading ? (
						<div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
							<IconLoader2 size={20} className="animate-spin" />
							<p className="text-xs">Henter klasser...</p>
						</div>
					) : filteredClasses.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-slate-400 p-3 text-center">
							<IconSchool size={28} className="mb-1.5 opacity-30" />
							<p className="text-xs font-medium text-slate-600">Ingen klasser fundet</p>
							<p className="text-[11px] text-slate-400 mt-0.5">
								{classes.length === 0
									? "Der er endnu ikke oprettet klasser til dette event."
									: "Prøv en anden søgning eller filter."}
							</p>
							<button
								onClick={handleStartCreate}
								className={cn(button(), "mt-2.5 text-xs py-1 px-2.5")}
							>
								<IconPlus size={14} /> Opret klasse
							</button>
						</div>
					) : (
						<ul className="flex flex-col gap-1.5">
							{filteredClasses.map((cls) => {
								const isSelected = selectedId === cls.id && viewMode !== "CREATE";
								const classTeamCount = teams.filter((t) => t.classId === cls.id).length;

								return (
									<li key={cls.id}>
										<button
											type="button"
											onClick={() => handleSelectClass(cls)}
											className={cn(
												"w-full text-left p-2.5 rounded-lg border transition-colors flex items-center justify-between group",
												isSelected
													? "bg-slate-900 text-white border-slate-900"
													: "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
											)}
										>
											<div className="flex items-center gap-2.5 min-w-0">
												<div
													className={cn(
														"w-8 h-8 rounded-md flex items-center justify-center shrink-0 font-medium text-xs",
														isSelected
															? "bg-slate-800 text-slate-200"
															: "bg-slate-100 text-slate-600"
													)}
												>
													<IconSchool size={16} />
												</div>
												<div className="min-w-0">
													<div className="font-medium text-xs truncate flex items-center gap-1.5">
														<span>{cls.name}</span>
														<span
															className={cn(
																"text-[10px] px-1 py-0.2 rounded font-normal truncate",
																isSelected
																	? "bg-slate-800 text-slate-300"
																	: "bg-slate-100 text-slate-600"
															)}
														>
															{cls.school}
														</span>
													</div>
													<div className="flex items-center gap-2 mt-0.5 text-[11px] opacity-60">
														{cls.teacherName && (
															<span className="truncate">{cls.teacherName}</span>
														)}
														<span className="ml-auto font-medium">
															{classTeamCount} hold
														</span>
													</div>
												</div>
											</div>

											<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
												<span
													role="button"
													title="Rediger"
													onClick={(e) => {
														e.stopPropagation();
														handleStartEdit(cls);
													}}
													className={cn(
														"p-1 rounded transition-colors cursor-pointer",
														isSelected
															? "hover:bg-slate-800 text-slate-300"
															: "hover:bg-slate-100 text-slate-400 hover:text-slate-700"
													)}
												>
													<IconEdit size={14} />
												</span>
												<span
													role="button"
													title="Slet"
													onClick={(e) => {
														e.stopPropagation();
														setClassToDelete(cls);
													}}
													className={cn(
														"p-1 rounded transition-colors cursor-pointer",
														isSelected
															? "hover:bg-red-900/60 text-red-300"
															: "hover:bg-red-50 text-slate-400 hover:text-red-600"
													)}
												>
													<IconTrash size={14} />
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
			<div className="flex-1 h-full overflow-y-auto p-6">
				{viewMode === "CREATE" ? (
					/* Create Class Form */
					<div className="max-w-xl mx-auto">
						<div className={cn(card(), "p-6")}>
							<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
								<div>
									<h2 className="text-lg font-bold text-slate-900">Opret ny klasse</h2>
									<p className="text-xs text-slate-500 mt-0.5">
										Opret en skoleklasse tilknyttet det aktuelle event.
									</p>
								</div>
								<button
									onClick={handleCancelForm}
									className={cn(iconButton(), "text-slate-400 hover:text-slate-600 p-1")}
								>
									<IconX size={18} />
								</button>
							</div>

							{formError && (
								<div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
									<IconAlertTriangle size={16} className="shrink-0" />
									<span>{formError}</span>
								</div>
							)}

							<form onSubmit={handleSaveForm} className="space-y-4">
								{/* Class Name */}
								<div>
									<label
										htmlFor="new-class-name"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Klassenavn *
									</label>
									<input
										id="new-class-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2 px-3 text-sm")}
										placeholder="f.eks. 8.A eller 10. Teknisk"
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* School with Autocomplete Selection Box */}
								<div>
									<div className="flex items-center justify-between mb-1.5">
										<label
											htmlFor="new-class-school"
											className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
										>
											Skole *
										</label>
										<span className="text-[11px] text-slate-400">
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
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Lærer / Kontaktperson (valgfri)
									</label>
									<div className="relative flex items-center">
										<IconUser size={16} className="absolute left-3 text-slate-400" />
										<input
											id="new-class-teacher"
											type="text"
											className={cn(textField(), "w-full pl-9 pr-3 py-2 text-sm")}
											placeholder="f.eks. Susanne Hansen"
											value={formTeacherName}
											onChange={(e) => setFormTeacherName(e.target.value)}
										/>
									</div>
								</div>

								{/* Number of Teams to Generate */}
								<div>
									<label
										htmlFor="new-class-teams-count"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Antal hold der skal autogenereres *
									</label>
									<div className="flex items-center gap-3">
										<input
											id="new-class-teams-count"
											type="number"
											min={1}
											max={30}
											required
											className={cn(textField(), "w-28 py-2 px-3 text-sm font-semibold")}
											value={formTeamCount}
											onChange={(e) =>
												setFormTeamCount(Math.max(1, parseInt(e.target.value) || 1))
											}
										/>
										<span className="text-xs text-slate-500">
											Hold (Hold 1, Hold 2 ...) med logins oprettes automatisk.
										</span>
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
									<button
										type="button"
										onClick={handleCancelForm}
										className={cn(
											button(),
											"px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
										)}
									>
										Annuller
									</button>
									<button
										type="submit"
										disabled={isSubmitting}
										className={cn(
											button(),
											"px-5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border-transparent flex items-center gap-1.5"
										)}
									>
										{isSubmitting && <IconLoader2 size={14} className="animate-spin" />}
										<span>Opret Klasse</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				) : viewMode === "EDIT" && selectedClass ? (
					/* Edit Class Form */
					<div className="max-w-xl mx-auto">
						<div className={cn(card(), "p-6")}>
							<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
								<div>
									<h2 className="text-lg font-bold text-slate-900">Rediger klasse</h2>
									<p className="text-xs text-slate-500 mt-0.5">
										Opdater oplysninger for {selectedClass.name}.
									</p>
								</div>
								<button
									onClick={handleCancelForm}
									className={cn(iconButton(), "text-slate-400 hover:text-slate-600 p-1")}
								>
									<IconX size={18} />
								</button>
							</div>

							{formError && (
								<div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
									<IconAlertTriangle size={16} className="shrink-0" />
									<span>{formError}</span>
								</div>
							)}

							<form onSubmit={handleSaveForm} className="space-y-4">
								{/* Class Name */}
								<div>
									<label
										htmlFor="edit-class-name"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Klassenavn *
									</label>
									<input
										id="edit-class-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2 px-3 text-sm")}
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* School */}
								<div>
									<label
										htmlFor="edit-class-school"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Skole *
									</label>
									<SchoolSelector
										value={formSchool}
										onChange={setFormSchool}
										existingSchools={schools}
										required
									/>
								</div>

								{/* Teacher Name */}
								<div>
									<label
										htmlFor="edit-class-teacher"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Lærer / Kontaktperson
									</label>
									<div className="relative flex items-center">
										<IconUser size={16} className="absolute left-3 text-slate-400" />
										<input
											id="edit-class-teacher"
											type="text"
											className={cn(textField(), "w-full pl-9 pr-3 py-2 text-sm")}
											placeholder="f.eks. Susanne Hansen"
											value={formTeacherName}
											onChange={(e) => setFormTeacherName(e.target.value)}
										/>
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
									<button
										type="button"
										onClick={handleCancelForm}
										className={cn(
											button(),
											"px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
										)}
									>
										Annuller
									</button>
									<button
										type="submit"
										disabled={isSubmitting}
										className={cn(
											button(),
											"px-5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border-transparent flex items-center gap-1.5"
										)}
									>
										{isSubmitting && <IconLoader2 size={14} className="animate-spin" />}
										<span>Gem Ændringer</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				) : selectedClass ? (
					/* View Class Details */
					<div className="max-w-2xl mx-auto space-y-4">
						{/* Class Header Card */}
						<div className={cn(card(), "p-5")}>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3.5">
									<div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
										<IconSchool size={22} />
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h2 className="text-xl font-bold text-slate-900">
												{selectedClass.name}
											</h2>
											<span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
												<IconBuildingCommunity size={13} />
												{selectedClass.school}
											</span>
										</div>
										<p className="text-xs text-slate-400 mt-0.5 font-mono">
											Klasse #{selectedClass.id} · Event #{activeEventId}
										</p>
									</div>
								</div>

								{/* Action buttons */}
								<div className="flex items-center gap-1.5">
									<button
										onClick={() => handleStartEdit(selectedClass)}
										className={cn(
											button(),
											"px-3 py-1.5 text-xs font-medium flex items-center gap-1 hover:border-slate-800"
										)}
									>
										<IconEdit size={14} /> Rediger
									</button>
									<button
										onClick={() => setClassToDelete(selectedClass)}
										className={cn(
											button(),
											"px-3 py-1.5 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center gap-1"
										)}
									>
										<IconTrash size={14} /> Slet
									</button>
								</div>
							</div>
						</div>

						{/* Class Information Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div className={cn(card(), "p-4 space-y-1")}>
								<div className="text-[11px] text-slate-400 font-semibold uppercase">
									Tilknyttet Skole
								</div>
								<div className="flex items-center gap-1.5 text-slate-800 font-medium text-sm">
									<IconBuildingCommunity size={16} className="text-slate-500" />
									<span>{selectedClass.school}</span>
								</div>
							</div>

							<div className={cn(card(), "p-4 space-y-1")}>
								<div className="text-[11px] text-slate-400 font-semibold uppercase">
									Lærer / Kontaktperson
								</div>
								<div className="flex items-center gap-1.5 text-slate-800 font-medium text-sm">
									<IconUser size={16} className="text-slate-500" />
									<span>{selectedClass.teacherName || "Ikke angivet"}</span>
								</div>
							</div>
						</div>

						{/* Teams in this class */}
						<div className={cn(card(), "p-5 space-y-3")}>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
										<IconUsers size={16} className="text-slate-500" />
										<span>Tilmeldte Hold ({selectedClassTeams.length})</span>
									</h3>
									<p className="text-[11px] text-slate-400 mt-0.5">
										Hold der er oprettet for denne klasse
									</p>
								</div>
								<Link
									href={`/admin/${activeEventId}/teams?classId=${selectedClass.id}`}
									className={cn(
										button(),
										"text-xs py-1 px-2.5 bg-slate-900 text-white border-transparent hover:bg-slate-800"
									)}
								>
									<IconPlus size={13} /> Opret nyt hold
								</Link>
							</div>

							{selectedClassTeams.length === 0 ? (
								<div className="p-5 rounded-lg bg-slate-50 border border-slate-200 text-center text-slate-400 text-xs">
									Der er ingen hold tilknyttet denne klasse endnu.
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{selectedClassTeams.map((team) => (
										<Link
											key={team.id}
											href={`/admin/${activeEventId}/teams/${team.id}`}
											className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between group"
										>
											<div className="flex items-center gap-2.5 min-w-0">
												<div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 text-xs font-bold">
													<IconUsers size={14} />
												</div>
												<div className="min-w-0">
													<div className="font-medium text-xs text-slate-900 group-hover:text-slate-800 truncate flex items-center gap-1">
														<span>{team.name}</span>
														{!team.isConfigured && (
															<span className="text-[9px] px-1 py-0.2 rounded font-semibold bg-amber-100 text-amber-800 shrink-0">
																Ny
															</span>
														)}
													</div>
													<div className="text-[10px] text-slate-400 font-mono">
														ID #{team.id}
													</div>
												</div>
											</div>
										</Link>
									))}
								</div>
							)}
						</div>
					</div>
				) : (
					/* Empty state */
					<div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto text-center">
						<div className="w-14 h-14 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
							<IconSchool size={26} />
						</div>
						<h3 className="text-base font-bold text-slate-800">Ingen klasse valgt</h3>
						<p className="text-xs text-slate-500 mt-1 mb-4">
							Vælg en klasse fra listen til venstre for at se og redigere detaljerne, eller opret en ny klasse.
						</p>
						<button
							onClick={handleStartCreate}
							className={cn(
								button(),
								"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
							)}
						>
							<IconPlus size={16} /> Opret ny klasse
						</button>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{classToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-100">
					<div className={cn(card(), "p-5 max-w-md w-full space-y-3.5")}>
						<div className="flex items-center gap-2.5 text-red-600">
							<div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
								<IconTrash size={18} />
							</div>
							<div>
								<h3 className="font-bold text-sm text-slate-900">Slet klasse</h3>
								<p className="text-[11px] text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-xs text-slate-600">
							Er du sikker på, at du vil slette klassen{" "}
							<span className="font-semibold text-slate-900">&quot;{classToDelete.name}&quot;</span> ({classToDelete.school})?
						</p>

						<div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
							<IconAlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
							<span>
								<strong>Bemærk:</strong> Sletning af denne klasse vil også automatisk slette alle tilknyttede hold og deres konti!
							</span>
						</div>

						<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeleting}
								onClick={() => setClassToDelete(null)}
								className={cn(
									button(),
									"px-3 py-1 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
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
									"px-4 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 border-transparent flex items-center gap-1.5"
								)}
							>
								{isDeleting && <IconLoader2 size={13} className="animate-spin" />}
								<span>Slet klasse</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
