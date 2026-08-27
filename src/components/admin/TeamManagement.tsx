"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
	IconUsers,
	IconSchool,
	IconKey,
	IconEye,
	IconEyeOff,
	IconCopy,
	IconShieldCheck,
	IconClock,
} from "@tabler/icons-react";
import { button, iconButton } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import SearchableSelect, { SearchableSelectOption } from "@/components/admin/SearchableSelect";
import { TeamModel, CreateTeamDTO, UpdateTeamDTO } from "@/models/TeamModel";
import { ClassModel } from "@/models/ClassModel";
import { AccountModel } from "@/models/AccountModel";
import {
	getTeams,
	createTeam,
	updateTeam,
	deleteTeam,
	getClasses,
	getAccounts,
} from "@/libs/API";

interface TeamManagementProps {
	initialTeamId?: number | null;
	eventId?: string | string[];
}

type ViewMode = "VIEW" | "CREATE" | "EDIT";

export default function TeamManagement({
	initialTeamId,
	eventId,
}: TeamManagementProps) {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const activeEventId = eventId || params.eventId || "0";
	const numEventId = Number(activeEventId);
	const initialClassParam = searchParams.get("classId");

	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [accounts, setAccounts] = useState<AccountModel[]>([]);
	const [loading, setLoading] = useState(true);

	const [selectedId, setSelectedId] = useState<number | null>(
		initialTeamId !== undefined && initialTeamId !== null ? initialTeamId : null
	);
	const [viewMode, setViewMode] = useState<ViewMode>("VIEW");
	const [searchQuery, setSearchQuery] = useState("");
	const [classFilter, setClassFilter] = useState<number | "ALL">(
		initialClassParam ? Number(initialClassParam) : "ALL"
	);

	// Form states
	const [formName, setFormName] = useState("");
	const [formClassId, setFormClassId] = useState<number>(-1);
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Team credentials show/hide & copy
	const [showPassword, setShowPassword] = useState(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Delete confirmation modal
	const [teamToDelete, setTeamToDelete] = useState<TeamModel | null>(null);
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

	const fetchData = async (selectTargetId?: number | null, isInitial = false) => {
		if (isInitial && teams.length === 0) {
			setLoading(true);
		}
		try {
			const [teamsData, classesData, accountsData] = await Promise.all([
				getTeams({ eventId: numEventId }),
				getClasses({ eventId: numEventId }),
				getAccounts(),
			]);
			setTeams(teamsData);
			setClasses(classesData);
			setAccounts(accountsData);

			if (initialClassParam && classesData.some((c) => c.id === Number(initialClassParam))) {
				setFormClassId(Number(initialClassParam));
			} else if (classesData.length > 0 && formClassId === -1) {
				setFormClassId(classesData[0].id);
			}

			if (selectTargetId !== undefined && selectTargetId !== null) {
				setSelectedId(selectTargetId);
			} else if (selectedId !== null) {
				const stillExists = teamsData.some((t) => t.id === selectedId);
				if (!stillExists) {
					setSelectedId(teamsData.length > 0 ? teamsData[0].id : null);
				}
			} else if (teamsData.length > 0 && initialTeamId === undefined && !initialClassParam) {
				setSelectedId(teamsData[0].id);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke hente hold";
			showNotification(msg, "error");
		} finally {
			setLoading(false);
		}
	};

	// Initial fetch on mount or when active eventId changes
	useEffect(() => {
		fetchData(initialTeamId, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [numEventId]);

	// Sync selectedId when initialTeamId changes externally without refetching full list
	useEffect(() => {
		if (initialTeamId !== undefined && initialTeamId !== null) {
			setSelectedId(initialTeamId);
		}
	}, [initialTeamId]);

	const selectedTeam = useMemo(() => {
		return teams.find((t) => t.id === selectedId) || null;
	}, [teams, selectedId]);

	const classMap = useMemo(() => {
		const map = new Map<number, ClassModel>();
		classes.forEach((c) => map.set(c.id, c));
		return map;
	}, [classes]);

	const accountMap = useMemo(() => {
		const map = new Map<number, AccountModel>();
		accounts.forEach((a) => map.set(a.id, a));
		return map;
	}, [accounts]);

	const selectedAccount = useMemo(() => {
		if (!selectedTeam) return null;
		return accountMap.get(selectedTeam.accountId) || null;
	}, [selectedTeam, accountMap]);

	const selectedClass = useMemo(() => {
		if (!selectedTeam) return null;
		return classMap.get(selectedTeam.classId) || null;
	}, [selectedTeam, classMap]);

	// Options for SearchableSelect
	const classOptions = useMemo<SearchableSelectOption<number>[]>(() => {
		return classes.map((cls) => ({
			value: cls.id,
			label: `${cls.name} (${cls.school})`,
			subLabel: cls.teacherName ? `Lærer: ${cls.teacherName}` : undefined,
			icon: <IconSchool size={16} />,
		}));
	}, [classes]);

	const filterClassOptions = useMemo<SearchableSelectOption<number | "ALL">[]>(() => {
		return [
			{ value: "ALL", label: `Alle klasser (${teams.length} hold)` },
			...classes.map((cls) => {
				const teamCount = teams.filter((t) => t.classId === cls.id).length;
				return {
					value: cls.id,
					label: `${cls.name} · ${cls.school}`,
					subLabel: `${teamCount} hold`,
					icon: <IconSchool size={16} />,
				};
			}),
		];
	}, [classes, teams]);

	// Filtered teams list
	const filteredTeams = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		return teams.filter((t) => {
			const cls = classMap.get(t.classId);
			const matchesClass =
				classFilter === "ALL" ? true : t.classId === classFilter;
			if (!matchesClass) return false;

			if (!q) return true;
			const matchesName = t.name.toLowerCase().includes(q);
			const matchesClassName = cls?.name.toLowerCase().includes(q) || false;
			const matchesSchool = cls?.school.toLowerCase().includes(q) || false;
			return matchesName || matchesClassName || matchesSchool;
		});
	}, [teams, searchQuery, classFilter, classMap]);

	const handleSelectTeam = (t: TeamModel) => {
		setSelectedId(t.id);
		setViewMode("VIEW");
		setFormError(null);
		setShowPassword(false);
		window.history.replaceState(null, "", `/admin/${activeEventId}/teams/${t.id}`);
	};

	const handleStartCreate = () => {
		setViewMode("CREATE");
		setFormName("");
		if (classes.length > 0 && formClassId === -1) {
			setFormClassId(classes[0].id);
		}
		setFormError(null);
	};

	const handleStartEdit = (t: TeamModel) => {
		setSelectedId(t.id);
		setViewMode("EDIT");
		setFormName(t.name);
		setFormClassId(t.classId);
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
		if (!trimmedName) {
			setFormError("Holdnavn er påkrævet");
			return;
		}

		if (formClassId === -1 || !classMap.has(formClassId)) {
			setFormError("Vælg venligst en gyldig klasse");
			return;
		}

		setIsSubmitting(true);
		try {
			if (viewMode === "CREATE") {
				const dto: CreateTeamDTO = {
					eventId: numEventId,
					classId: formClassId,
					name: trimmedName,
				};
				const created = await createTeam(dto);
				await fetchData(created.id);
				setViewMode("VIEW");
				showNotification(`Holdet '${created.name}' er oprettet med tilhørende konto!`);
				window.history.replaceState(null, "", `/admin/${activeEventId}/teams/${created.id}`);
			} else if (viewMode === "EDIT" && selectedTeam) {
				const dto: UpdateTeamDTO = {
					name: trimmedName,
					classId: formClassId,
				};
				const updated = await updateTeam(selectedTeam.id, dto);
				await fetchData(updated.id);
				setViewMode("VIEW");
				showNotification(`Holdet '${updated.name}' er opdateret!`);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Handlingen mislykkedes";
			setFormError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!teamToDelete) return;
		setIsDeleting(true);
		try {
			await deleteTeam(teamToDelete.id);
			showNotification(`Holdet '${teamToDelete.name}' og dets konto er slettet.`);
			setTeamToDelete(null);
			const remaining = teams.filter((t) => t.id !== teamToDelete.id);
			setTeams(remaining);
			if (selectedId === teamToDelete.id) {
				const nextSelected = remaining.length > 0 ? remaining[0].id : null;
				setSelectedId(nextSelected);
				if (nextSelected !== null) {
					window.history.replaceState(null, "", `/admin/${activeEventId}/teams/${nextSelected}`);
				} else {
					window.history.replaceState(null, "", `/admin/${activeEventId}/teams`);
				}
			}
			await fetchData(selectedId === teamToDelete.id ? null : selectedId);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke slette holdet";
			showNotification(msg, "error");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCopy = (text: string, fieldName: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(fieldName);
		setTimeout(() => setCopiedField(null), 2000);
	};

	return (
		<div className="flex h-full w-full bg-slate-50 relative overflow-hidden">
			{/* Toast notification */}
			{toast && (
				<div
					className={cn(
						"absolute top-4 right-4 z-50 px-3.5 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 shadow-sm",
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

			{/* Left Column: Teams Directory */}
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
							placeholder="Søg hold eller klasse..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={handleStartCreate}
						title="Opret nyt hold"
						className={cn(
							iconButton(),
							"bg-slate-900 text-white hover:bg-slate-800 border-transparent p-1.5"
						)}
					>
						<IconPlus size={18} />
					</button>
				</div>

				{/* Class filter dropdown */}
				{classes.length > 0 && (
					<div>
						<SearchableSelect<number | "ALL">
							value={classFilter}
							onChange={(val) => setClassFilter(val || "ALL")}
							options={filterClassOptions}
							placeholder="Filtrer efter klasse..."
							leftIcon={<IconSchool size={16} />}
						/>
					</div>
				)}

				{/* Teams List */}
				<div className="flex-1 overflow-y-auto pr-0.5">
					{loading && teams.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
							<IconLoader2 size={20} className="animate-spin" />
							<p className="text-xs">Henter hold...</p>
						</div>
					) : filteredTeams.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-slate-400 p-3 text-center">
							<IconUsers size={28} className="mb-1.5 opacity-30" />
							<p className="text-xs font-medium text-slate-600">Ingen hold fundet</p>
							<p className="text-[11px] text-slate-400 mt-0.5">
								{teams.length === 0
									? "Der er endnu ikke oprettet hold til dette event."
									: "Prøv et andet filter eller en anden søgning."}
							</p>
							<button
								onClick={handleStartCreate}
								className={cn(button(), "mt-2.5 text-xs py-1 px-2.5")}
							>
								<IconPlus size={14} /> Opret hold
							</button>
						</div>
					) : (
						<ul className="flex flex-col gap-1.5">
							{filteredTeams.map((team) => {
								const isSelected = selectedId === team.id && viewMode !== "CREATE";
								const cls = classMap.get(team.classId);

								return (
									<li key={team.id}>
										<button
											type="button"
											onClick={() => handleSelectTeam(team)}
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
													<IconUsers size={16} />
												</div>
												<div className="min-w-0">
													<div className="font-medium text-xs truncate flex items-center gap-1.5">
														<span>{team.name}</span>
														{!team.isConfigured && (
															<span
																className={cn(
																	"text-[9px] px-1 py-0.2 rounded font-normal uppercase",
																	isSelected
																		? "bg-slate-800 text-slate-300"
																		: "bg-slate-100 text-slate-600"
																)}
															>
																Ny
															</span>
														)}
													</div>
													<div className="flex items-center gap-2 mt-0.5 text-[11px] opacity-60">
														<span className="truncate">
															{cls ? `${cls.name} · ${cls.school}` : `Klasse #${team.classId}`}
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
														handleStartEdit(team);
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
														setTeamToDelete(team);
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
					/* Create Team Form */
					<div className="max-w-xl mx-auto">
						<div className={cn(card(), "p-6")}>
							<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
								<div>
									<h2 className="text-lg font-bold text-slate-900">Opret nyt hold</h2>
									<p className="text-xs text-slate-500 mt-0.5">
										Opret et enkelt hold manuelt til en eksisterende klasse. Der oprettes automatisk en tilknyttet brugerkonto.
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
								{/* Team Name */}
								<div>
									<label
										htmlFor="new-team-name"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Holdnavn *
									</label>
									<input
										id="new-team-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2 px-3 text-sm")}
										placeholder="f.eks. Hold 4 eller De Hurtige Murere"
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* Select Class with SearchableSelect */}
								<div>
									<label
										htmlFor="new-team-class"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Tilhørende Klasse *
									</label>
									{classes.length === 0 ? (
										<p className="text-xs text-red-500">
											Der er ingen klasser tilgængelige. Opret en klasse først under &quot;Klasser&quot;.
										</p>
									) : (
										<SearchableSelect<number>
											id="new-team-class"
											required
											value={formClassId !== -1 ? formClassId : null}
											onChange={(val) => setFormClassId(val !== null ? val : -1)}
											options={classOptions}
											placeholder="Vælg klasse..."
											leftIcon={<IconSchool size={16} />}
										/>
									)}
								</div>

								{/* Account Info Notice */}
								<div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
									<IconKey size={16} className="text-slate-500 shrink-0 mt-0.5" />
									<div>
										<p className="font-semibold text-slate-800">Automatisk Hold-Login</p>
										<p className="mt-0.5 text-slate-500">
											Der oprettes automatisk en fælles brugerkonto til holdet. Ved første login kan eleverne selv vælge et holdnavn og avatar.
										</p>
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
										disabled={isSubmitting || classes.length === 0}
										className={cn(
											button(),
											"px-5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border-transparent flex items-center gap-1.5"
										)}
									>
										{isSubmitting && <IconLoader2 size={14} className="animate-spin" />}
										<span>Opret Hold</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				) : viewMode === "EDIT" && selectedTeam ? (
					/* Edit Team Form */
					<div className="max-w-xl mx-auto">
						<div className={cn(card(), "p-6")}>
							<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
								<div>
									<h2 className="text-lg font-bold text-slate-900">Rediger hold</h2>
									<p className="text-xs text-slate-500 mt-0.5">
										Opdater oplysninger for {selectedTeam.name}.
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
								{/* Team Name */}
								<div>
									<label
										htmlFor="edit-team-name"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Holdnavn *
									</label>
									<input
										id="edit-team-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2 px-3 text-sm")}
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* Change Class with SearchableSelect */}
								<div>
									<label
										htmlFor="edit-team-class"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Tilhørende Klasse *
									</label>
									<SearchableSelect<number>
										id="edit-team-class"
										required
										value={formClassId !== -1 ? formClassId : null}
										onChange={(val) => setFormClassId(val !== null ? val : -1)}
										options={classOptions}
										placeholder="Vælg klasse..."
										leftIcon={<IconSchool size={16} />}
									/>
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
				) : selectedTeam ? (
					/* View Team Details */
					<div className="max-w-2xl mx-auto space-y-4">
						{/* Team Header Card */}
						<div className={cn(card(), "p-5")}>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3.5">
									<div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold">
										<IconUsers size={22} />
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h2 className="text-xl font-bold text-slate-900">
												{selectedTeam.name}
											</h2>
											<span
												className={cn(
													"text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider",
													selectedTeam.isConfigured
														? "bg-slate-100 text-slate-700"
														: "bg-slate-100 text-slate-500"
												)}
											>
												{selectedTeam.isConfigured ? "Klar" : "Afventer opsætning"}
											</span>
										</div>
										<p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
											{selectedClass ? (
												<>
													<span className="font-semibold text-slate-700">{selectedClass.name}</span>
													<span>·</span>
													<span>{selectedClass.school}</span>
												</>
											) : (
												<span>Klasse #{selectedTeam.classId}</span>
											)}
										</p>
									</div>
								</div>

								{/* Action buttons */}
								<div className="flex items-center gap-1.5">
									<button
										onClick={() => handleStartEdit(selectedTeam)}
										className={cn(
											button(),
											"px-3 py-1.5 text-xs font-medium flex items-center gap-1 hover:border-slate-800"
										)}
									>
										<IconEdit size={14} /> Rediger
									</button>
									<button
										onClick={() => setTeamToDelete(selectedTeam)}
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

						{/* Team Account Credentials Card */}
						{selectedAccount && (
							<div className={cn(card(), "p-5 space-y-3")}>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
											<IconKey size={16} className="text-slate-400" />
											<span>Tilknyttet Holdkonto</span>
										</h3>
										<p className="text-[11px] text-slate-400 mt-0.5">
											Eleverne bruger dette login til at tilgå konkurrencesiden
										</p>
									</div>
									<Link
										href={`/admin/${activeEventId}/accounts/${selectedAccount.id}`}
										className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
									>
										Se i Konti
									</Link>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{/* Username */}
									<div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
										<div className="text-[11px] text-slate-400 font-semibold uppercase">
											Brugernavn
										</div>
										<div className="flex items-center justify-between mt-1">
											<span className="font-semibold text-slate-800 truncate text-sm">
												{selectedAccount.username}
											</span>
											<button
												type="button"
												onClick={() => handleCopy(selectedAccount.username, "team_username")}
												title="Kopier brugernavn"
												className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
											>
												{copiedField === "team_username" ? (
													<IconCheck size={14} className="text-emerald-600" />
												) : (
													<IconCopy size={14} />
												)}
											</button>
										</div>
									</div>

									{/* Password */}
									<div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
										<div className="text-[11px] text-slate-400 font-semibold uppercase">
											Adgangskode
										</div>
										<div className="flex items-center justify-between mt-1">
											<span className="font-mono text-slate-800 text-sm">
												{showPassword ? selectedAccount.password : "••••••••"}
											</span>
											<div className="flex items-center gap-0.5">
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													title={showPassword ? "Skjul kode" : "Vis kode"}
													className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
												>
													{showPassword ? <IconEyeOff size={14} /> : <IconEye size={14} />}
												</button>
												<button
													type="button"
													onClick={() => handleCopy(selectedAccount.password, "team_password")}
													title="Kopier kode"
													className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
												>
													{copiedField === "team_password" ? (
														<IconCheck size={14} className="text-emerald-600" />
													) : (
														<IconCopy size={14} />
													)}
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				) : (
					/* Empty state */
					<div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto text-center">
						<div className="w-14 h-14 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
							<IconUsers size={26} />
						</div>
						<h3 className="text-base font-bold text-slate-800">Intet hold valgt</h3>
						<p className="text-xs text-slate-500 mt-1 mb-4">
							Vælg et hold fra listen til venstre for at se og redigere detaljerne, eller opret et nyt hold.
						</p>
						<button
							onClick={handleStartCreate}
							className={cn(
								button(),
								"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
							)}
						>
							<IconPlus size={16} /> Opret nyt hold
						</button>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{teamToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-100">
					<div className={cn(card(), "p-5 max-w-md w-full space-y-3.5")}>
						<div className="flex items-center gap-2.5 text-red-600">
							<div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
								<IconTrash size={18} />
							</div>
							<div>
								<h3 className="font-bold text-sm text-slate-900">Slet hold</h3>
								<p className="text-[11px] text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-xs text-slate-600">
							Er du sikker på, at du vil slette holdet{" "}
							<span className="font-semibold text-slate-900">&quot;{teamToDelete.name}&quot;</span>?
						</p>

						<div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
							<IconAlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
							<span>
								<strong>Advarsel:</strong> Sletning af dette hold vil også slette den tilknyttede holdkonto samt alle holdets registrerede stationstider!
							</span>
						</div>

						<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeleting}
								onClick={() => setTeamToDelete(null)}
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
								<span>Slet hold</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
