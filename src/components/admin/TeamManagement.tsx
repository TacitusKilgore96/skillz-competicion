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
	IconBuildingCommunity,
	IconKey,
	IconEye,
	IconEyeOff,
	IconCopy,
	IconSparkles,
	IconClock,
} from "@tabler/icons-react";
import { button, iconButton } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import { TeamModel } from "@/models/TeamModel";
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

	const initialClassParam = searchParams.get("createWithClassId");

	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [accounts, setAccounts] = useState<AccountModel[]>([]);
	const [loading, setLoading] = useState(true);

	const [selectedId, setSelectedId] = useState<number | null>(
		initialTeamId !== undefined && initialTeamId !== null ? initialTeamId : null
	);
	const [viewMode, setViewMode] = useState<ViewMode>(
		initialClassParam ? "CREATE" : "VIEW"
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [classFilter, setClassFilter] = useState<number | "ALL">("ALL");

	// Form states
	const [formClassId, setFormClassId] = useState<number>(
		initialClassParam ? Number(initialClassParam) : -1
	);
	const [formName, setFormName] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Detail view states for credentials
	const [showPasswordDetails, setShowPasswordDetails] = useState(false);
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
		}, 4000);
	};

	const fetchData = async (selectTargetId?: number | null) => {
		setLoading(true);
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

	useEffect(() => {
		fetchData(initialTeamId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialTeamId, numEventId]);

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

	// Filtered teams
	const filteredTeams = useMemo(() => {
		return teams.filter((t) => {
			const matchesClass = classFilter === "ALL" || t.classId === classFilter;
			const cls = classMap.get(t.classId);
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				q === "" ||
				t.name.toLowerCase().includes(q) ||
				(cls && cls.name.toLowerCase().includes(q)) ||
				(cls && cls.school.toLowerCase().includes(q));
			return matchesClass && matchesSearch;
		});
	}, [teams, classFilter, searchQuery, classMap]);

	const handleSelectTeam = (team: TeamModel) => {
		setSelectedId(team.id);
		setViewMode("VIEW");
		setFormError(null);
		setShowPasswordDetails(false);
		startTransition(() => {
			router.push(`/admin/${activeEventId}/teams/${team.id}`);
		});
	};

	const handleStartCreate = () => {
		setViewMode("CREATE");
		setFormClassId(classes.length > 0 ? classes[0].id : -1);
		setFormName("");
		setFormError(null);
	};

	const handleStartEdit = (team: TeamModel) => {
		setSelectedId(team.id);
		setViewMode("EDIT");
		setFormClassId(team.classId);
		setFormName(team.name);
		setFormError(null);
	};

	const handleCancelForm = () => {
		setViewMode("VIEW");
		setFormError(null);
	};

	const handleCopy = (text: string, fieldName: string) => {
		navigator.clipboard.writeText(text);
		setCopiedField(fieldName);
		setTimeout(() => setCopiedField(null), 2000);
	};

	const handleSaveForm = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		const trimmedName = formName.trim();
		if (!trimmedName) {
			setFormError("Indtast venligst et holdnavn (f.eks. Hold 1).");
			return;
		}

		if (formClassId === -1 || !classMap.has(formClassId)) {
			setFormError("Vælg venligst en gyldig klasse til holdet.");
			return;
		}

		setIsSubmitting(true);
		try {
			if (viewMode === "CREATE") {
				const created = await createTeam({
					eventId: numEventId,
					classId: formClassId,
					name: trimmedName,
				});
				await fetchData(created.id);
				setViewMode("VIEW");
				showNotification(`Holdet '${created.name}' er oprettet med tilhørende login!`);
				router.push(`/admin/${activeEventId}/teams/${created.id}`);
			} else if (viewMode === "EDIT" && selectedTeam) {
				const updated = await updateTeam(selectedTeam.id, {
					classId: formClassId,
					name: trimmedName,
				});
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
			showNotification(`Holdet '${teamToDelete.name}' og tilhørende konto er slettet.`);
			setTeamToDelete(null);
			const remaining = teams.filter((t) => t.id !== teamToDelete.id);
			setTeams(remaining);
			if (selectedId === teamToDelete.id) {
				const nextSelected = remaining.length > 0 ? remaining[0].id : null;
				setSelectedId(nextSelected);
				if (nextSelected !== null) {
					router.push(`/admin/${activeEventId}/teams/${nextSelected}`);
				} else {
					router.push(`/admin/${activeEventId}/teams`);
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

			{/* Left Column: Teams Directory */}
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
							placeholder="Søg efter hold, klasse, skole..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={handleStartCreate}
						title="Opret nyt hold"
						className={cn(
							iconButton(),
							"bg-hover text-white hover:bg-emerald-600 border-transparent shadow-sm"
						)}
					>
						<IconPlus size={20} />
					</button>
				</div>

				{/* Class Filter Dropdown */}
				{classes.length > 0 && (
					<div className="flex items-center gap-2">
						<label htmlFor="team-class-filter" className="text-xs font-bold text-slate-500 shrink-0">
							Klasse:
						</label>
						<select
							id="team-class-filter"
							value={classFilter}
							onChange={(e) =>
								setClassFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
							}
							className={cn(
								textField(),
								"w-full text-xs py-1.5 px-2.5 bg-slate-50 cursor-pointer font-medium"
							)}
						>
							<option value="ALL">Alle klasser ({teams.length} hold)</option>
							{classes.map((cls) => {
								const count = teams.filter((t) => t.classId === cls.id).length;
								return (
									<option key={cls.id} value={cls.id}>
										{cls.name} ({cls.school}) — {count} hold
									</option>
								);
							})}
						</select>
					</div>
				)}

				{/* Teams List */}
				<div className="flex-1 overflow-y-auto pr-1">
					{loading ? (
						<div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
							<IconLoader2 size={24} className="animate-spin" />
							<p className="text-sm">Henter hold...</p>
						</div>
					) : filteredTeams.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4 text-center">
							<IconUsers size={32} className="mb-2 opacity-40" />
							<p className="text-sm font-medium">Ingen hold fundet</p>
							<p className="text-xs text-slate-400 mt-1">
								{teams.length === 0
									? "Der er endnu ikke oprettet hold til dette event."
									: "Prøv en anden søgning eller filtrering."}
							</p>
							<button
								onClick={handleStartCreate}
								className={cn(button(), "mt-3 text-xs flex items-center gap-1")}
							>
								<IconPlus size={14} /> Opret hold
							</button>
						</div>
					) : (
						<ul className="flex flex-col gap-2">
							{filteredTeams.map((team) => {
								const isSelected = selectedId === team.id && viewMode !== "CREATE";
								const cls = classMap.get(team.classId);

								return (
									<li key={team.id}>
										<button
											type="button"
											onClick={() => handleSelectTeam(team)}
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
															? "bg-indigo-500/30 text-indigo-200"
															: "bg-indigo-50 text-indigo-700"
													)}
												>
													<IconUsers size={20} />
												</div>
												<div className="min-w-0">
													<div className="font-bold text-sm truncate flex items-center gap-2">
														<span>{team.name}</span>
														{team.isConfigured === false && (
															<span
																title="Afventer elev-opsætning ved første login"
																className={cn(
																	"text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md",
																	isSelected
																		? "bg-amber-400/20 text-amber-300"
																		: "bg-amber-100 text-amber-800"
																)}
															>
																Afventer
															</span>
														)}
													</div>
													<div className="flex items-center gap-1.5 mt-0.5 text-xs opacity-75">
														{cls && (
															<span className="truncate">
																{cls.name} · {cls.school}
															</span>
														)}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<span
													role="button"
													title="Rediger"
													onClick={(e) => {
														e.stopPropagation();
														handleStartEdit(team);
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
														setTeamToDelete(team);
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
					/* Create Team Form */
					<div className="max-w-2xl mx-auto">
						<div className={cn(card(), "bg-white p-8 shadow-sm")}>
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-2xl font-bold text-slate-800">Opret nyt hold</h2>
									<p className="text-sm text-slate-500 mt-1">
										Opret et deltagende hold tilknyttet en klasse.
									</p>
								</div>
								<button
									onClick={handleCancelForm}
									className={cn(iconButton(), "text-slate-400 hover:text-slate-600")}
								>
									<IconX size={20} />
								</button>
							</div>

							{classes.length === 0 ? (
								<div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-3">
									<div className="flex items-center gap-2 font-bold">
										<IconAlertTriangle size={20} className="text-amber-600" />
										<span>Ingen klasser oprettet endnu</span>
									</div>
									<p className="text-xs text-amber-800">
										For at kunne oprette et hold skal der først findes mindst én klasse i dette event.
									</p>
									<Link
										href={`/admin/${activeEventId}/classes`}
										className={cn(button(), "inline-flex items-center gap-1.5 text-xs bg-amber-600 text-white hover:bg-amber-700 border-transparent")}
									>
										<IconPlus size={14} /> Gå til opret klasse
									</Link>
								</div>
							) : (
								<>
									{formError && (
										<div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
											<IconAlertTriangle size={18} className="shrink-0" />
											<span>{formError}</span>
										</div>
									)}

									<form onSubmit={handleSaveForm} className="space-y-6">
										{/* Choose Class */}
										<div>
											<label
												htmlFor="new-team-class"
												className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
											>
												Vælg Klasse & Skole *
											</label>
											<select
												id="new-team-class"
												required
												value={formClassId}
												onChange={(e) => setFormClassId(Number(e.target.value))}
												className={cn(
													textField(),
													"w-full py-2.5 px-4 text-sm bg-white cursor-pointer"
												)}
											>
												{classes.map((cls) => (
													<option key={cls.id} value={cls.id}>
														{cls.name} — {cls.school} {cls.teacherName ? `(${cls.teacherName})` : ""}
													</option>
												))}
											</select>
										</div>

										{/* Team Name */}
										<div>
											<label
												htmlFor="new-team-name"
												className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
											>
												Holdnavn *
											</label>
											<input
												id="new-team-name"
												type="text"
												required
												className={cn(textField(), "w-full py-2.5 px-4 text-sm")}
												placeholder="f.eks. Hold 1, De Hurtige, Turbotømrerne"
												value={formName}
												onChange={(e) => setFormName(e.target.value)}
											/>
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
												<span>Opret Hold</span>
											</button>
										</div>
									</form>
								</>
							)}
						</div>
					</div>
				) : viewMode === "EDIT" && selectedTeam ? (
					/* Edit Team Form */
					<div className="max-w-2xl mx-auto">
						<div className={cn(card(), "bg-white p-8 shadow-sm")}>
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-2xl font-bold text-slate-800">Rediger hold</h2>
									<p className="text-sm text-slate-500 mt-1">
										Opdater oplysninger for {selectedTeam.name}.
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
								{/* Choose Class */}
								<div>
									<label
										htmlFor="edit-team-class"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Vælg Klasse & Skole *
									</label>
									<select
										id="edit-team-class"
										required
										value={formClassId}
										onChange={(e) => setFormClassId(Number(e.target.value))}
										className={cn(
											textField(),
											"w-full py-2.5 px-4 text-sm bg-white cursor-pointer"
										)}
									>
										{classes.map((cls) => (
											<option key={cls.id} value={cls.id}>
												{cls.name} — {cls.school} {cls.teacherName ? `(${cls.teacherName})` : ""}
											</option>
										))}
									</select>
								</div>

								{/* Team Name */}
								<div>
									<label
										htmlFor="edit-team-name"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Holdnavn *
									</label>
									<input
										id="edit-team-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2.5 px-4 text-sm")}
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
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
				) : selectedTeam ? (
					/* View Team Details */
					<div className="max-w-2xl mx-auto space-y-6">
						{/* Header Card */}
						<div className={cn(card(), "bg-white p-6 shadow-sm")}>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-800 flex items-center justify-center text-white shadow-inner">
										<IconUsers size={32} />
									</div>
									<div>
										<div className="flex items-center gap-2.5">
											<h2 className="text-2xl font-bold text-slate-900">
												{selectedTeam.name}
											</h2>
											<span
												className={cn(
													"text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1",
													selectedTeam.isConfigured === false
														? "bg-amber-100 text-amber-800"
														: "bg-emerald-100 text-emerald-800"
												)}
											>
												{selectedTeam.isConfigured === false ? (
													<>
														<IconClock size={14} />
														<span>Afventer elev-opsætning</span>
													</>
												) : (
													<>
														<IconCheck size={14} />
														<span>Klar</span>
													</>
												)}
											</span>
										</div>
										<p className="text-xs text-slate-400 mt-1 font-mono">
											Hold ID #{selectedTeam.id} · Event #{activeEventId}
										</p>
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-2">
									<button
										onClick={() => handleStartEdit(selectedTeam)}
										className={cn(
											button(),
											"px-4 py-1.5 text-sm font-semibold flex items-center gap-1.5 hover:border-slate-800"
										)}
									>
										<IconEdit size={16} /> Rediger
									</button>
									<button
										onClick={() => setTeamToDelete(selectedTeam)}
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

						{/* Shared Team Login Account Card */}
						{selectedAccount && (
							<div className={cn(card(), "bg-white p-6 shadow-sm space-y-4")}>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
											<IconKey size={18} className="text-amber-600" />
											<span>Delt Hold-Login</span>
										</h3>
										<p className="text-xs text-slate-400 mt-0.5">
											Konto som holdets elever logger ind med på appen
										</p>
									</div>
									<Link
										href={`/admin/${activeEventId}/accounts/${selectedAccount.id}`}
										className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
									>
										Se i Konti
									</Link>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Username */}
									<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
										<div className="text-xs text-slate-400 font-semibold uppercase">
											Brugernavn
										</div>
										<div className="flex items-center justify-between mt-2">
											<span className="font-semibold text-slate-800 truncate text-base">
												{selectedAccount.username}
											</span>
											<button
												type="button"
												onClick={() => handleCopy(selectedAccount.username, "team_username")}
												title="Kopier brugernavn"
												className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
											>
												{copiedField === "team_username" ? (
													<IconCheck size={16} className="text-emerald-600" />
												) : (
													<IconCopy size={16} />
												)}
											</button>
										</div>
									</div>

									{/* Password */}
									<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
										<div className="text-xs text-slate-400 font-semibold uppercase">
											Adgangskode
										</div>
										<div className="flex items-center justify-between mt-2">
											<span className="font-mono text-slate-800 text-base">
												{showPasswordDetails ? selectedAccount.password : "••••••••"}
											</span>
											<div className="flex items-center gap-1">
												<button
													type="button"
													onClick={() => setShowPasswordDetails(!showPasswordDetails)}
													title={showPasswordDetails ? "Skjul kode" : "Vis kode"}
													className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
												>
													{showPasswordDetails ? (
														<IconEyeOff size={16} />
													) : (
														<IconEye size={16} />
													)}
												</button>
												<button
													type="button"
													onClick={() => handleCopy(selectedAccount.password, "team_password")}
													title="Kopier kode"
													className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
												>
													{copiedField === "team_password" ? (
														<IconCheck size={16} className="text-emerald-600" />
													) : (
														<IconCopy size={16} />
													)}
												</button>
											</div>
										</div>
									</div>
								</div>

								{selectedTeam.isConfigured === false && (
									<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
										<IconSparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
										<span>
											Holdet er i initiel tilstand. Første gang eleverne logger ind, vil de blive bedt om at navngive holdet og vælge holdets logo/billede.
										</span>
									</div>
								)}
							</div>
						)}

						{/* Class & School Details */}
						{classMap.get(selectedTeam.classId) && (
							<div className={cn(card(), "bg-white p-6 shadow-sm space-y-3")}>
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
										Tilknyttet Klasse & Skole
									</h3>
									<Link
										href={`/admin/${activeEventId}/classes/${selectedTeam.classId}`}
										className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
									>
										Se klasse
									</Link>
								</div>

								<div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
									<div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
										<IconSchool size={24} />
									</div>
									<div>
										<div className="font-bold text-slate-900 text-base">
											Klasse {classMap.get(selectedTeam.classId)?.name}
										</div>
										<div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
											<IconBuildingCommunity size={14} className="text-slate-400" />
											<span>{classMap.get(selectedTeam.classId)?.school}</span>
											{classMap.get(selectedTeam.classId)?.teacherName && (
												<>
													<span>·</span>
													<span>Lærer: {classMap.get(selectedTeam.classId)?.teacherName}</span>
												</>
											)}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				) : (
					/* Empty state */
					<div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
						<div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
							<IconUsers size={36} />
						</div>
						<h3 className="text-xl font-bold text-slate-800">Ingen hold valgt</h3>
						<p className="text-sm text-slate-500 mt-2 mb-6">
							Vælg et hold fra listen til venstre for at administrere det, eller opret et nyt hold.
						</p>
						<button
							onClick={handleStartCreate}
							className={cn(
								button(),
								"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-6 py-2 font-bold flex items-center gap-2"
							)}
						>
							<IconPlus size={18} /> Opret nyt hold
						</button>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{teamToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
					<div className={cn(card(), "bg-white p-6 max-w-md w-full shadow-2xl space-y-4")}>
						<div className="flex items-center gap-3 text-red-600">
							<div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
								<IconTrash size={22} />
							</div>
							<div>
								<h3 className="font-bold text-lg text-slate-900">Slet hold</h3>
								<p className="text-xs text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-sm text-slate-600">
							Er du sikker på, at du vil slette holdet{" "}
							<span className="font-bold text-slate-900">&quot;{teamToDelete.name}&quot;</span>?
						</p>

						<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
							<IconAlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
							<span>
								<strong>Advarsel:</strong> Sletning af holdet vil automatisk også slette den tilknyttede hold-konto, da et hold og dets konto er tæt forbundet og ikke kan eksistere uden hinanden.
							</span>
						</div>

						<div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeleting}
								onClick={() => setTeamToDelete(null)}
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
								<span>Slet hold</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
