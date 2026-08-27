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
	IconFlag,
	IconMapPin,
	IconClock,
	IconKey,
	IconEye,
	IconEyeOff,
	IconCopy,
	IconTrophy,
	IconTrendingUp,
	IconUsers,
	IconFileDescription,
} from "@tabler/icons-react";
import { button, iconButton } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import SearchableSelect, { SearchableSelectOption } from "@/components/admin/SearchableSelect";
import { StationModel, StationTimeModel } from "@/models/StationModel";
import { TeamModel } from "@/models/TeamModel";
import { ClassModel } from "@/models/ClassModel";
import { AccountModel } from "@/models/AccountModel";
import {
	getStations,
	createStation,
	updateStation,
	deleteStation,
	getStationTimes,
	createStationTime,
	updateStationTime,
	deleteStationTime,
	getTeams,
	getClasses,
	getAccounts,
} from "@/libs/API";

interface StationManagementProps {
	initialStationId?: number | null;
	eventId?: string | string[];
}

type ViewMode = "VIEW" | "CREATE" | "EDIT";

function formatSeconds(totalSeconds: number): string {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export default function StationManagement({
	initialStationId,
	eventId,
}: StationManagementProps) {
	const router = useRouter();
	const params = useParams();
	const activeEventId = eventId || params.eventId || "0";
	const numEventId = Number(activeEventId);

	const [stations, setStations] = useState<StationModel[]>([]);
	const [stationTimes, setStationTimes] = useState<StationTimeModel[]>([]);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [accounts, setAccounts] = useState<AccountModel[]>([]);
	const [loading, setLoading] = useState(true);

	const [selectedId, setSelectedId] = useState<number | null>(
		initialStationId !== undefined && initialStationId !== null ? initialStationId : null
	);
	const [viewMode, setViewMode] = useState<ViewMode>("VIEW");
	const [searchQuery, setSearchQuery] = useState("");

	// Station form states
	const [formName, setFormName] = useState("");
	const [formLocation, setFormLocation] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Station Guard login credentials visibility & copy
	const [showPassword, setShowPassword] = useState(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Delete station modal
	const [stationToDelete, setStationToDelete] = useState<StationModel | null>(null);
	const [isDeletingStation, setIsDeletingStation] = useState(false);

	// Time entry modal (Add / Edit)
	const [timeModalOpen, setTimeModalOpen] = useState(false);
	const [editingTimeId, setEditingTimeId] = useState<number | null>(null);
	const [formTeamId, setFormTeamId] = useState<number>(-1);
	const [formMinutes, setFormMinutes] = useState<number>(0);
	const [formSeconds, setFormSeconds] = useState<number>(0);
	const [timeFormError, setTimeFormError] = useState<string | null>(null);
	const [isSubmittingTime, setIsSubmittingTime] = useState(false);

	// Delete time modal
	const [timeToDelete, setTimeToDelete] = useState<StationTimeModel | null>(null);
	const [isDeletingTime, setIsDeletingTime] = useState(false);

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
			const [stationsData, timesData, teamsData, classesData, accountsData] =
				await Promise.all([
					getStations({ eventId: numEventId }),
					getStationTimes({ eventId: numEventId }),
					getTeams({ eventId: numEventId }),
					getClasses({ eventId: numEventId }),
					getAccounts(),
				]);

			setStations(stationsData);
			setStationTimes(timesData);
			setTeams(teamsData);
			setClasses(classesData);
			setAccounts(accountsData);

			if (selectTargetId !== undefined && selectTargetId !== null) {
				setSelectedId(selectTargetId);
			} else if (selectedId !== null) {
				const stillExists = stationsData.some((s) => s.id === selectedId);
				if (!stillExists) {
					setSelectedId(stationsData.length > 0 ? stationsData[0].id : null);
				}
			} else if (stationsData.length > 0 && initialStationId === undefined) {
				setSelectedId(stationsData[0].id);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke hente stationsdata";
			showNotification(msg, "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(initialStationId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialStationId, numEventId]);

	const selectedStation = useMemo(() => {
		return stations.find((s) => s.id === selectedId) || null;
	}, [stations, selectedId]);

	const classMap = useMemo(() => {
		const map = new Map<number, ClassModel>();
		classes.forEach((c) => map.set(c.id, c));
		return map;
	}, [classes]);

	const teamMap = useMemo(() => {
		const map = new Map<number, TeamModel>();
		teams.forEach((t) => map.set(t.id, t));
		return map;
	}, [teams]);

	const accountMap = useMemo(() => {
		const map = new Map<number, AccountModel>();
		accounts.forEach((a) => map.set(a.id, a));
		return map;
	}, [accounts]);

	const selectedAccount = useMemo(() => {
		if (!selectedStation) return null;
		return accountMap.get(selectedStation.accountId) || null;
	}, [selectedStation, accountMap]);

	// Times for the currently selected station, sorted by fastest time ascending
	const currentStationTimes = useMemo(() => {
		if (!selectedStation) return [];
		return stationTimes
			.filter((st) => st.stationId === selectedStation.id)
			.sort((a, b) => a.timeSeconds - b.timeSeconds);
	}, [stationTimes, selectedStation]);

	// Statistics for selected station
	const stationStats = useMemo(() => {
		if (currentStationTimes.length === 0) {
			return { count: 0, bestTime: null, avgTime: null };
		}
		const count = currentStationTimes.length;
		const bestTime = currentStationTimes[0].timeSeconds;
		const sum = currentStationTimes.reduce((acc, curr) => acc + curr.timeSeconds, 0);
		const avgTime = Math.round(sum / count);
		return { count, bestTime, avgTime };
	}, [currentStationTimes]);

	// Filtered stations in left list
	const filteredStations = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		return stations.filter((s) => {
			if (!q) return true;
			return (
				s.name.toLowerCase().includes(q) ||
				(s.location && s.location.toLowerCase().includes(q)) ||
				(s.description && s.description.toLowerCase().includes(q))
			);
		});
	}, [stations, searchQuery]);

	// Teams available for adding a time (teams that don't already have a time recorded, plus current team if editing)
	const availableTeamsForTime = useMemo(() => {
		if (!selectedStation) return [];
		const recordedTeamIds = new Set(
			stationTimes
				.filter((st) => st.stationId === selectedStation.id && st.id !== editingTimeId)
				.map((st) => st.teamId)
		);
		return teams.filter((t) => !recordedTeamIds.has(t.id));
	}, [teams, stationTimes, selectedStation, editingTimeId]);

	// SearchableSelect options for teams
	const teamSelectOptions = useMemo<SearchableSelectOption<number>[]>(() => {
		const list = editingTimeId !== null ? teams : availableTeamsForTime;
		return list.map((t) => {
			const cls = classMap.get(t.classId);
			return {
				value: t.id,
				label: t.name,
				subLabel: cls ? `${cls.name} · ${cls.school}` : undefined,
				icon: <IconUsers size={16} />,
			};
		});
	}, [editingTimeId, teams, availableTeamsForTime, classMap]);

	const handleSelectStation = (st: StationModel) => {
		setSelectedId(st.id);
		setViewMode("VIEW");
		setFormError(null);
		setShowPassword(false);
		startTransition(() => {
			router.push(`/admin/${activeEventId}/stations/${st.id}`);
		});
	};

	const handleStartCreate = () => {
		setViewMode("CREATE");
		setFormName("");
		setFormLocation("");
		setFormDescription("");
		setFormError(null);
	};

	const handleStartEdit = (st: StationModel) => {
		setSelectedId(st.id);
		setViewMode("EDIT");
		setFormName(st.name);
		setFormLocation(st.location || "");
		setFormDescription(st.description || "");
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

	const handleSaveStation = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		const trimmedName = formName.trim();
		if (!trimmedName) {
			setFormError("Indtast venligst et stationsnavn (f.eks. Station 1 - Tømrer).");
			return;
		}

		setIsSubmitting(true);
		try {
			if (viewMode === "CREATE") {
				const created = await createStation({
					eventId: numEventId,
					name: trimmedName,
					location: formLocation.trim() || undefined,
					description: formDescription.trim() || undefined,
				});
				await fetchData(created.id);
				setViewMode("VIEW");
				showNotification(`Stationen '${created.name}' er oprettet med tilhørende postvagt-login!`);
				router.push(`/admin/${activeEventId}/stations/${created.id}`);
			} else if (viewMode === "EDIT" && selectedStation) {
				const updated = await updateStation(selectedStation.id, {
					name: trimmedName,
					location: formLocation.trim() || undefined,
					description: formDescription.trim() || undefined,
				});
				await fetchData(updated.id);
				setViewMode("VIEW");
				showNotification(`Stationen '${updated.name}' er opdateret!`);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Handlingen mislykkedes";
			setFormError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteStationConfirm = async () => {
		if (!stationToDelete) return;
		setIsDeletingStation(true);
		try {
			await deleteStation(stationToDelete.id);
			showNotification(`Stationen '${stationToDelete.name}', tilhørende konto og alle tider er slettet.`);
			setStationToDelete(null);
			const remaining = stations.filter((s) => s.id !== stationToDelete.id);
			setStations(remaining);
			if (selectedId === stationToDelete.id) {
				const nextSelected = remaining.length > 0 ? remaining[0].id : null;
				setSelectedId(nextSelected);
				if (nextSelected !== null) {
					router.push(`/admin/${activeEventId}/stations/${nextSelected}`);
				} else {
					router.push(`/admin/${activeEventId}/stations`);
				}
			}
			await fetchData(selectedId === stationToDelete.id ? null : selectedId);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke slette stationen";
			showNotification(msg, "error");
		} finally {
			setIsDeletingStation(false);
		}
	};

	// --- Time Modal Handlers ---
	const handleOpenAddTimeModal = () => {
		if (!selectedStation) return;
		setEditingTimeId(null);
		const defaultTeam = availableTeamsForTime.length > 0 ? availableTeamsForTime[0].id : -1;
		setFormTeamId(defaultTeam);
		setFormMinutes(0);
		setFormSeconds(0);
		setTimeFormError(null);
		setTimeModalOpen(true);
	};

	const handleOpenEditTimeModal = (st: StationTimeModel) => {
		setEditingTimeId(st.id);
		setFormTeamId(st.teamId);
		const mins = Math.floor(st.timeSeconds / 60);
		const secs = st.timeSeconds % 60;
		setFormMinutes(mins);
		setFormSeconds(secs);
		setTimeFormError(null);
		setTimeModalOpen(true);
	};

	const handleSaveTime = async (e: React.FormEvent) => {
		e.preventDefault();
		setTimeFormError(null);

		if (!selectedStation) return;

		if (formTeamId === -1 || !teamMap.has(formTeamId)) {
			setTimeFormError("Vælg venligst et deltagende hold.");
			return;
		}

		const totalTime = Number(formMinutes) * 60 + Number(formSeconds);
		if (totalTime <= 0) {
			setTimeFormError("Tidtagningen skal være over 0 sekunder.");
			return;
		}

		setIsSubmittingTime(true);
		try {
			if (editingTimeId === null) {
				await createStationTime({
					eventId: numEventId,
					stationId: selectedStation.id,
					teamId: formTeamId,
					timeSeconds: totalTime,
				});
				showNotification("Holdtid er registreret!");
			} else {
				await updateStationTime(editingTimeId, {
					teamId: formTeamId,
					timeSeconds: totalTime,
				});
				showNotification("Tidsregistrering er opdateret!");
			}
			setTimeModalOpen(false);
			await fetchData(selectedStation.id);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke gemme tidsregistreringen";
			setTimeFormError(msg);
		} finally {
			setIsSubmittingTime(false);
		}
	};

	const handleDeleteTimeConfirm = async () => {
		if (!timeToDelete) return;
		setIsDeletingTime(true);
		try {
			await deleteStationTime(timeToDelete.id);
			showNotification("Tidsregistreringen er slettet.");
			setTimeToDelete(null);
			await fetchData(selectedId);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke slette tidsregistreringen";
			showNotification(msg, "error");
		} finally {
			setIsDeletingTime(false);
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

			{/* Left Column: Stations Directory */}
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
							placeholder="Søg station eller lokation..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={handleStartCreate}
						title="Opret ny station"
						className={cn(
							iconButton(),
							"bg-hover text-white hover:bg-emerald-600 border-transparent shadow-sm"
						)}
					>
						<IconPlus size={20} />
					</button>
				</div>

				{/* Stations List */}
				<div className="flex-1 overflow-y-auto pr-1">
					{loading ? (
						<div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
							<IconLoader2 size={24} className="animate-spin" />
							<p className="text-sm">Henter stationer...</p>
						</div>
					) : filteredStations.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4 text-center">
							<IconFlag size={32} className="mb-2 opacity-40" />
							<p className="text-sm font-medium">Ingen stationer fundet</p>
							<p className="text-xs text-slate-400 mt-1">
								{stations.length === 0
									? "Der er endnu ikke oprettet stationer til dette event."
									: "Prøv en anden søgning."}
							</p>
							<button
								onClick={handleStartCreate}
								className={cn(button(), "mt-3 text-xs flex items-center gap-1")}
							>
								<IconPlus size={14} /> Opret station
							</button>
						</div>
					) : (
						<ul className="flex flex-col gap-2">
							{filteredStations.map((station) => {
								const isSelected = selectedId === station.id && viewMode !== "CREATE";
								const stationTimeCount = stationTimes.filter(
									(st) => st.stationId === station.id
								).length;

								return (
									<li key={station.id}>
										<button
											type="button"
											onClick={() => handleSelectStation(station)}
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
															? "bg-emerald-500/30 text-emerald-200"
															: "bg-emerald-50 text-emerald-700"
													)}
												>
													<IconFlag size={20} />
												</div>
												<div className="min-w-0">
													<div className="font-bold text-sm truncate flex items-center gap-2">
														<span>{station.name}</span>
													</div>
													<div className="flex items-center gap-2 mt-0.5 text-xs opacity-75">
														{station.location ? (
															<span className="truncate flex items-center gap-1">
																<IconMapPin size={12} />
																{station.location}
															</span>
														) : (
															<span className="font-mono text-[11px]">
																ID #{station.id}
															</span>
														)}
														<span
															className={cn(
																"text-[10px] font-semibold px-1.5 py-0.2 rounded-md ml-auto",
																isSelected
																	? "bg-emerald-400/20 text-emerald-200"
																	: "bg-emerald-50 text-emerald-700"
															)}
														>
															{stationTimeCount} tider
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
														handleStartEdit(station);
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
														setStationToDelete(station);
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
					/* Create Station Form */
					<div className="max-w-2xl mx-auto">
						<div className={cn(card(), "bg-white p-8 shadow-sm")}>
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-2xl font-bold text-slate-800">Opret ny station</h2>
									<p className="text-sm text-slate-500 mt-1">
										Opret en post/station tilknyttet det aktuelle event. Der oprettes automatisk et tilhørende postvagt-login.
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

							<form onSubmit={handleSaveStation} className="space-y-6">
								{/* Station Name */}
								<div>
									<label
										htmlFor="new-station-name"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Stationsnavn / Postnavn *
									</label>
									<input
										id="new-station-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2.5 px-4 text-sm")}
										placeholder="f.eks. Post 1 - Tømrer / Savning eller Station A - Murer"
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* Location */}
								<div>
									<label
										htmlFor="new-station-location"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Placering / Lokation (valgfri)
									</label>
									<div className="relative flex items-center">
										<IconMapPin size={18} className="absolute left-3.5 text-slate-400" />
										<input
											id="new-station-location"
											type="text"
											className={cn(textField(), "w-full pl-10 pr-4 py-2.5 text-sm")}
											placeholder="f.eks. Hal A, Værksted 2, Udendørsareal"
											value={formLocation}
											onChange={(e) => setFormLocation(e.target.value)}
										/>
									</div>
								</div>

								{/* Description / Instructions */}
								<div>
									<label
										htmlFor="new-station-description"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Beskrivelse / Opgaveinstruks (valgfri)
									</label>
									<textarea
										id="new-station-description"
										rows={3}
										className={cn(textField(), "w-full py-2.5 px-4 text-sm resize-none")}
										placeholder="Kort beskrivelse af aktiviteten eller kriterier for tidtagning..."
										value={formDescription}
										onChange={(e) => setFormDescription(e.target.value)}
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
										<span>Opret Station</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				) : viewMode === "EDIT" && selectedStation ? (
					/* Edit Station Form */
					<div className="max-w-2xl mx-auto">
						<div className={cn(card(), "bg-white p-8 shadow-sm")}>
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-2xl font-bold text-slate-800">Rediger station</h2>
									<p className="text-sm text-slate-500 mt-1">
										Opdater oplysninger for {selectedStation.name}.
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

							<form onSubmit={handleSaveStation} className="space-y-6">
								{/* Station Name */}
								<div>
									<label
										htmlFor="edit-station-name"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Stationsnavn / Postnavn *
									</label>
									<input
										id="edit-station-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2.5 px-4 text-sm")}
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* Location */}
								<div>
									<label
										htmlFor="edit-station-location"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Placering / Lokation (valgfri)
									</label>
									<div className="relative flex items-center">
										<IconMapPin size={18} className="absolute left-3.5 text-slate-400" />
										<input
											id="edit-station-location"
											type="text"
											className={cn(textField(), "w-full pl-10 pr-4 py-2.5 text-sm")}
											value={formLocation}
											onChange={(e) => setFormLocation(e.target.value)}
										/>
									</div>
								</div>

								{/* Description */}
								<div>
									<label
										htmlFor="edit-station-description"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Beskrivelse / Opgaveinstruks (valgfri)
									</label>
									<textarea
										id="edit-station-description"
										rows={3}
										className={cn(textField(), "w-full py-2.5 px-4 text-sm resize-none")}
										value={formDescription}
										onChange={(e) => setFormDescription(e.target.value)}
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
				) : selectedStation ? (
					/* View Station Details */
					<div className="max-w-4xl mx-auto space-y-6">
						{/* Station Header Card */}
						<div className={cn(card(), "bg-white p-6 shadow-sm")}>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-4">
									<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-inner">
										<IconFlag size={32} />
									</div>
									<div>
										<div className="flex items-center gap-2.5">
											<h2 className="text-2xl font-bold text-slate-900">
												{selectedStation.name}
											</h2>
											{selectedStation.location && (
												<span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
													<IconMapPin size={14} />
													{selectedStation.location}
												</span>
											)}
										</div>
										<p className="text-xs text-slate-400 mt-1 font-mono">
											Station ID #{selectedStation.id} · Event #{activeEventId}
										</p>
									</div>
								</div>

								{/* Action buttons */}
								<div className="flex items-center gap-2">
									<button
										onClick={() => handleStartEdit(selectedStation)}
										className={cn(
											button(),
											"px-4 py-1.5 text-sm font-semibold flex items-center gap-1.5 hover:border-slate-800"
										)}
									>
										<IconEdit size={16} /> Rediger
									</button>
									<button
										onClick={() => setStationToDelete(selectedStation)}
										className={cn(
											button(),
											"px-4 py-1.5 text-sm font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400 flex items-center gap-1.5"
										)}
									>
										<IconTrash size={16} /> Slet
									</button>
								</div>
							</div>

							{selectedStation.description && (
								<div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 flex items-start gap-2">
									<IconFileDescription size={18} className="text-slate-400 shrink-0 mt-0.5" />
									<p className="leading-relaxed">{selectedStation.description}</p>
								</div>
							)}
						</div>

						{/* Station Guard Account Credentials Card */}
						{selectedAccount && (
							<div className={cn(card(), "bg-white p-6 shadow-sm space-y-4")}>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
											<IconKey size={18} className="text-emerald-600" />
											<span>Tilknyttet Postvagt-Login</span>
										</h3>
										<p className="text-xs text-slate-400 mt-0.5">
											Konto til postvagten som styrer tidtagningen for denne station
										</p>
									</div>
									<Link
										href={`/admin/${activeEventId}/accounts/${selectedAccount.id}`}
										className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
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
												onClick={() => handleCopy(selectedAccount.username, "guard_username")}
												title="Kopier brugernavn"
												className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
											>
												{copiedField === "guard_username" ? (
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
												{showPassword ? selectedAccount.password : "••••••••"}
											</span>
											<div className="flex items-center gap-1">
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													title={showPassword ? "Skjul kode" : "Vis kode"}
													className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
												>
													{showPassword ? (
														<IconEyeOff size={16} />
													) : (
														<IconEye size={16} />
													)}
												</button>
												<button
													type="button"
													onClick={() => handleCopy(selectedAccount.password, "guard_password")}
													title="Kopier kode"
													className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
												>
													{copiedField === "guard_password" ? (
														<IconCheck size={16} className="text-emerald-600" />
													) : (
														<IconCopy size={16} />
													)}
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Station Times Overview & Stats */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className={cn(card(), "bg-white p-5 shadow-sm space-y-1")}>
								<div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
									<IconUsers size={16} className="text-indigo-600" />
									<span>Gennemførte Hold</span>
								</div>
								<div className="text-2xl font-bold text-slate-900">
									{stationStats.count} <span className="text-xs text-slate-400 font-normal">/ {teams.length} hold</span>
								</div>
							</div>

							<div className={cn(card(), "bg-white p-5 shadow-sm space-y-1")}>
								<div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
									<IconTrophy size={16} className="text-amber-500" />
									<span>Hurtigste Tid</span>
								</div>
								<div className="text-2xl font-bold text-slate-900 font-mono">
									{stationStats.bestTime !== null ? formatSeconds(stationStats.bestTime) : "—"}
								</div>
							</div>

							<div className={cn(card(), "bg-white p-5 shadow-sm space-y-1")}>
								<div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
									<IconTrendingUp size={16} className="text-emerald-600" />
									<span>Gennemsnitstid</span>
								</div>
								<div className="text-2xl font-bold text-slate-900 font-mono">
									{stationStats.avgTime !== null ? formatSeconds(stationStats.avgTime) : "—"}
								</div>
							</div>
						</div>

						{/* Team Times Table / List */}
						<div className={cn(card(), "bg-white p-6 shadow-sm space-y-4")}>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
										<IconClock size={18} className="text-indigo-600" />
										<span>Registrerede Holdtider ({currentStationTimes.length})</span>
									</h3>
									<p className="text-xs text-slate-400 mt-0.5">
										Oversigt over registrerede gennemførelsestider for deltagende hold
									</p>
								</div>
								<button
									onClick={handleOpenAddTimeModal}
									className={cn(
										button(),
										"text-xs font-semibold flex items-center gap-1.5 bg-slate-900 text-white border-transparent hover:bg-slate-800 shadow-sm"
									)}
								>
									<IconPlus size={14} /> Registrer holdtid
								</button>
							</div>

							{currentStationTimes.length === 0 ? (
								<div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-400 space-y-2">
									<IconClock size={32} className="mx-auto opacity-40" />
									<p className="font-semibold text-slate-700">Ingen tider registreret endnu</p>
									<p className="text-xs text-slate-400 max-w-sm mx-auto">
										Når holdene fuldfører aktiviteten på denne post, kan postvagten eller arrangøren registrere holdets opnåede tid.
									</p>
									<button
										onClick={handleOpenAddTimeModal}
										className={cn(button(), "mt-2 text-xs inline-flex items-center gap-1")}
									>
										<IconPlus size={14} /> Tilføj første tid
									</button>
								</div>
							) : (
								<div className="overflow-x-auto rounded-2xl border border-slate-200">
									<table className="w-full text-left text-sm">
										<thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200">
											<tr>
												<th className="py-3 px-4 w-16 text-center">Plads</th>
												<th className="py-3 px-4">Hold</th>
												<th className="py-3 px-4">Klasse & Skole</th>
												<th className="py-3 px-4 text-right">Tid</th>
												<th className="py-3 px-4 w-20 text-right">Handlinger</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-100">
											{currentStationTimes.map((st, index) => {
												const team = teamMap.get(st.teamId);
												const cls = team ? classMap.get(team.classId) : undefined;
												const isFirst = index === 0;
												const isSecond = index === 1;
												const isThird = index === 2;

												return (
													<tr
														key={st.id}
														className="hover:bg-slate-50/80 transition-colors group"
													>
														{/* Placement */}
														<td className="py-3 px-4 text-center">
															<span
																className={cn(
																	"inline-flex items-center justify-center w-7 h-7 rounded-xl font-bold text-xs",
																	isFirst
																		? "bg-amber-100 text-amber-900 border border-amber-300"
																		: isSecond
																		? "bg-slate-200 text-slate-800"
																		: isThird
																		? "bg-amber-700/10 text-amber-800"
																		: "text-slate-400"
																)}
															>
																{isFirst ? (
																	<IconTrophy size={14} className="text-amber-600" />
																) : (
																	`#${index + 1}`
																)}
															</span>
														</td>

														{/* Team */}
														<td className="py-3 px-4 font-bold text-slate-900">
															<Link
																href={`/admin/${activeEventId}/teams/${st.teamId}`}
																className="hover:text-emerald-700 hover:underline inline-flex items-center gap-1.5"
															>
																<span>{team ? team.name : `Hold #${st.teamId}`}</span>
															</Link>
														</td>

														{/* Class & School */}
														<td className="py-3 px-4 text-xs text-slate-500">
															{cls ? (
																<div>
																	<span className="font-semibold text-slate-700">{cls.name}</span>
																	<span className="text-slate-400"> · {cls.school}</span>
																</div>
															) : (
																"—"
															)}
														</td>

														{/* Time */}
														<td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-base">
															{formatSeconds(st.timeSeconds)}
														</td>

														{/* Actions */}
														<td className="py-3 px-4 text-right">
															<div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
																<button
																	type="button"
																	title="Rediger tid"
																	onClick={() => handleOpenEditTimeModal(st)}
																	className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
																>
																	<IconEdit size={16} />
																</button>
																<button
																	type="button"
																	title="Slet registrering"
																	onClick={() => setTimeToDelete(st)}
																	className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
																>
																	<IconTrash size={16} />
																</button>
															</div>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</div>
				) : (
					/* Empty state */
					<div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
						<div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
							<IconFlag size={36} />
						</div>
						<h3 className="text-xl font-bold text-slate-800">Ingen station valgt</h3>
						<p className="text-sm text-slate-500 mt-2 mb-6">
							Vælg en station fra listen til venstre for at administrere den og se holdenes tider, eller opret en ny station.
						</p>
						<button
							onClick={handleStartCreate}
							className={cn(
								button(),
								"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-6 py-2 font-bold flex items-center gap-2"
							)}
						>
							<IconPlus size={18} /> Opret ny station
						</button>
					</div>
				)}
			</div>

			{/* Modal: Add / Edit Team Time */}
			{timeModalOpen && selectedStation && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
					<div className={cn(card(), "bg-white p-6 max-w-lg w-full shadow-2xl space-y-5")}>
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<div className="flex items-center gap-2.5">
								<div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
									<IconClock size={20} />
								</div>
								<div>
									<h3 className="font-bold text-lg text-slate-900">
										{editingTimeId === null ? "Registrer Holdtid" : "Rediger Tidsregistrering"}
									</h3>
									<p className="text-xs text-slate-400">{selectedStation.name}</p>
								</div>
							</div>
							<button
								onClick={() => setTimeModalOpen(false)}
								className={cn(iconButton(), "text-slate-400 hover:text-slate-600")}
							>
								<IconX size={18} />
							</button>
						</div>

						{timeFormError && (
							<div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
								<IconAlertTriangle size={16} className="shrink-0" />
								<span>{timeFormError}</span>
							</div>
						)}

						<form onSubmit={handleSaveTime} className="space-y-4">
							{/* Team selection using SearchableSelect */}
							<div>
								<label
									htmlFor="time-modal-team"
									className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
								>
									Vælg Hold *
								</label>
								<SearchableSelect<number>
									id="time-modal-team"
									required
									value={formTeamId !== -1 ? formTeamId : null}
									onChange={(val) => setFormTeamId(val)}
									options={teamSelectOptions}
									placeholder="Vælg eller søg hold..."
									leftIcon={<IconUsers size={18} />}
									emptyText="Alle deltagende hold har allerede fået registreret en tid på denne post."
								/>
							</div>

							{/* Duration Inputs: Minutes + Seconds */}
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
									Opnået Tid *
								</label>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label
											htmlFor="time-minutes"
											className="block text-[11px] font-semibold text-slate-400 mb-1"
										>
											Minutter
										</label>
										<input
											id="time-minutes"
											type="number"
											min={0}
											max={120}
											required
											className={cn(textField(), "w-full py-2 px-3 text-base font-mono font-bold")}
											value={formMinutes}
											onChange={(e) =>
												setFormMinutes(Math.max(0, parseInt(e.target.value) || 0))
											}
										/>
									</div>
									<div>
										<label
											htmlFor="time-seconds"
											className="block text-[11px] font-semibold text-slate-400 mb-1"
										>
											Sekunder
										</label>
										<input
											id="time-seconds"
											type="number"
											min={0}
											max={59}
											required
											className={cn(textField(), "w-full py-2 px-3 text-base font-mono font-bold")}
											value={formSeconds}
											onChange={(e) =>
												setFormSeconds(
													Math.min(59, Math.max(0, parseInt(e.target.value) || 0))
												)
											}
										/>
									</div>
								</div>
								<p className="text-xs text-slate-400 mt-1">
									Tid:{" "}
									<span className="font-mono font-bold text-slate-800">
										{formatSeconds(formMinutes * 60 + formSeconds)}
									</span>
								</p>
							</div>

							{/* Actions */}
							<div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setTimeModalOpen(false)}
									className={cn(
										button(),
										"px-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 border-slate-200"
									)}
								>
									Annuller
								</button>
								<button
									type="submit"
									disabled={isSubmittingTime}
									className={cn(
										button(),
										"px-5 py-1.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border-transparent shadow-sm flex items-center gap-2"
									)}
								>
									{isSubmittingTime && <IconLoader2 size={16} className="animate-spin" />}
									<span>{editingTimeId === null ? "Gem holdtid" : "Opdater tid"}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Station Confirmation Modal */}
			{stationToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
					<div className={cn(card(), "bg-white p-6 max-w-md w-full shadow-2xl space-y-4")}>
						<div className="flex items-center gap-3 text-red-600">
							<div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
								<IconTrash size={22} />
							</div>
							<div>
								<h3 className="font-bold text-lg text-slate-900">Slet station</h3>
								<p className="text-xs text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-sm text-slate-600">
							Er du sikker på, at du vil slette stationen{" "}
							<span className="font-bold text-slate-900">&quot;{stationToDelete.name}&quot;</span>?
						</p>

						<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
							<IconAlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
							<span>
								<strong>Advarsel:</strong> Sletning af stationen vil automatisk slette den tilknyttede postvagt-konto samt alle registrerede holdtider for denne post!
							</span>
						</div>

						<div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeletingStation}
								onClick={() => setStationToDelete(null)}
								className={cn(
									button(),
									"px-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 border-slate-200"
								)}
							>
								Annuller
							</button>
							<button
								type="button"
								disabled={isDeletingStation}
								onClick={handleDeleteStationConfirm}
								className={cn(
									button(),
									"px-5 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 border-transparent shadow-sm flex items-center gap-2"
								)}
							>
								{isDeletingStation && <IconLoader2 size={16} className="animate-spin" />}
								<span>Slet station</span>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Time Confirmation Modal */}
			{timeToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
					<div className={cn(card(), "bg-white p-6 max-w-md w-full shadow-2xl space-y-4")}>
						<div className="flex items-center gap-3 text-red-600">
							<div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
								<IconTrash size={22} />
							</div>
							<div>
								<h3 className="font-bold text-lg text-slate-900">Slet tidsregistrering</h3>
								<p className="text-xs text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-sm text-slate-600">
							Er du sikker på, at du vil slette tidsregistreringen for{" "}
							<span className="font-bold text-slate-900">
								{teamMap.get(timeToDelete.teamId)?.name || `Hold #${timeToDelete.teamId}`}
							</span>{" "}
							({formatSeconds(timeToDelete.timeSeconds)})?
						</p>

						<div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeletingTime}
								onClick={() => setTimeToDelete(null)}
								className={cn(
									button(),
									"px-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 border-slate-200"
								)}
							>
								Annuller
							</button>
							<button
								type="button"
								disabled={isDeletingTime}
								onClick={handleDeleteTimeConfirm}
								className={cn(
									button(),
									"px-5 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 border-transparent shadow-sm flex items-center gap-2"
								)}
							>
								{isDeletingTime && <IconLoader2 size={16} className="animate-spin" />}
								<span>Slet tid</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
