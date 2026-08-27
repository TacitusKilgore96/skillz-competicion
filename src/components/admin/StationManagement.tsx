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
	IconKey,
	IconEye,
	IconEyeOff,
	IconCopy,
	IconClock,
	IconUsers,
	IconFileDescription,
	IconAdjustments,
} from "@tabler/icons-react";
import { button, iconButton } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import SearchableSelect, { SearchableSelectOption } from "@/components/admin/SearchableSelect";
import {
	StationModel,
	StationTimeModel,
	CreateStationDTO,
	UpdateStationDTO,
	CreateStationTimeDTO,
	UpdateStationTimeDTO,
} from "@/models/StationModel";
import { TeamModel } from "@/models/TeamModel";
import { AccountModel } from "@/models/AccountModel";
import { ClassModel } from "@/models/ClassModel";
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

export default function StationManagement({
	initialStationId,
	eventId,
}: StationManagementProps) {
	const router = useRouter();
	const params = useParams();
	const activeEventId = eventId || params.eventId || "0";
	const numEventId = Number(activeEventId);

	const [stations, setStations] = useState<StationModel[]>([]);
	const [teams, setTeams] = useState<TeamModel[]>([]);
	const [classes, setClasses] = useState<ClassModel[]>([]);
	const [accounts, setAccounts] = useState<AccountModel[]>([]);
	const [times, setTimes] = useState<StationTimeModel[]>([]);
	const [loading, setLoading] = useState(true);

	const [selectedId, setSelectedId] = useState<number | null>(
		initialStationId !== undefined && initialStationId !== null ? initialStationId : null
	);
	const [viewMode, setViewMode] = useState<ViewMode>("VIEW");
	const [searchQuery, setSearchQuery] = useState("");

	// Station Form states
	const [formName, setFormName] = useState("");
	const [formLocation, setFormLocation] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Station Guard Account credentials visibility
	const [showPassword, setShowPassword] = useState(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Time Modal states (Add / Edit Time)
	const [timeModalOpen, setTimeModalOpen] = useState(false);
	const [editingTime, setEditingTime] = useState<StationTimeModel | null>(null);
	const [timeTeamId, setTimeTeamId] = useState<number>(-1);
	const [timeMinutes, setTimeMinutes] = useState<string>("0");
	const [timeSeconds, setTimeSeconds] = useState<string>("00");
	const [timeMilliseconds, setTimeMilliseconds] = useState<string>("000");
	const [timePoints, setTimePoints] = useState<string>("");
	const [timeModalError, setTimeModalError] = useState<string | null>(null);
	const [isTimeSubmitting, setIsTimeSubmitting] = useState(false);

	// Delete confirmation modal (Station)
	const [stationToDelete, setStationToDelete] = useState<StationModel | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Delete confirmation modal (Time)
	const [timeToDelete, setTimeToDelete] = useState<StationTimeModel | null>(null);
	const [isDeletingTime, setIsDeletingTime] = useState(false);

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
			const [stationsData, teamsData, classesData, accountsData, timesData] =
				await Promise.all([
					getStations({ eventId: numEventId }),
					getTeams({ eventId: numEventId }),
					getClasses({ eventId: numEventId }),
					getAccounts(),
					getStationTimes(),
				]);

			setStations(stationsData);
			setTeams(teamsData);
			setClasses(classesData);
			setAccounts(accountsData);
			setTimes(timesData);

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

	const teamMap = useMemo(() => {
		const map = new Map<number, TeamModel>();
		teams.forEach((t) => map.set(t.id, t));
		return map;
	}, [teams]);

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
		if (!selectedStation) return null;
		return accountMap.get(selectedStation.accountId) || null;
	}, [selectedStation, accountMap]);

	// Times recorded for the selected station, sorted by time ascending
	const stationTimes = useMemo(() => {
		if (!selectedStation) return [];
		return times
			.filter((t) => t.stationId === selectedStation.id)
			.sort((a, b) => a.timeSeconds - b.timeSeconds);
	}, [times, selectedStation]);

	// Team options for SearchableSelect
	const teamSelectOptions = useMemo<SearchableSelectOption<number>[]>(() => {
		return teams.map((tm) => {
			const cls = classMap.get(tm.classId);
			return {
				value: tm.id,
				label: tm.name,
				subLabel: cls ? `${cls.name} · ${cls.school}` : undefined,
				icon: <IconUsers size={16} />,
			};
		});
	}, [teams, classMap]);

	// Filtered stations list
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

	const handleSelectStation = (s: StationModel) => {
		setSelectedId(s.id);
		setViewMode("VIEW");
		setFormError(null);
		setShowPassword(false);
		startTransition(() => {
			router.push(`/admin/${activeEventId}/stations/${s.id}`);
		});
	};

	const handleStartCreate = () => {
		setViewMode("CREATE");
		setFormName("");
		setFormLocation("");
		setFormDescription("");
		setFormError(null);
	};

	const handleStartEdit = (s: StationModel) => {
		setSelectedId(s.id);
		setViewMode("EDIT");
		setFormName(s.name);
		setFormLocation(s.location || "");
		setFormDescription(s.description || "");
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
			setFormError("Stationsnavn er påkrævet");
			return;
		}

		setIsSubmitting(true);
		try {
			if (viewMode === "CREATE") {
				const dto: CreateStationDTO = {
					eventId: numEventId,
					name: trimmedName,
					location: formLocation.trim() || undefined,
					description: formDescription.trim() || undefined,
				};
				const created = await createStation(dto);
				await fetchData(created.id);
				setViewMode("VIEW");
				showNotification(`Stationen '${created.name}' er oprettet med postvagt-konto!`);
				router.push(`/admin/${activeEventId}/stations/${created.id}`);
			} else if (viewMode === "EDIT" && selectedStation) {
				const dto: UpdateStationDTO = {
					name: trimmedName,
					location: formLocation.trim() || undefined,
					description: formDescription.trim() || undefined,
				};
				const updated = await updateStation(selectedStation.id, dto);
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

	const handleDeleteConfirm = async () => {
		if (!stationToDelete) return;
		setIsDeleting(true);
		try {
			await deleteStation(stationToDelete.id);
			showNotification(`Stationen '${stationToDelete.name}' og dens konto er slettet.`);
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
			setIsDeleting(false);
		}
	};

	// Open Add Time Modal
	const handleOpenAddTime = () => {
		setEditingTime(null);
		setTimeTeamId(teams.length > 0 ? teams[0].id : -1);
		setTimeMinutes("0");
		setTimeSeconds("00");
		setTimeMilliseconds("000");
		setTimePoints("");
		setTimeModalError(null);
		setTimeModalOpen(true);
	};

	// Open Edit Time Modal
	const handleOpenEditTime = (timeRecord: StationTimeModel) => {
		setEditingTime(timeRecord);
		setTimeTeamId(timeRecord.teamId);

		const totalSec = timeRecord.timeSeconds;
		const mins = Math.floor(totalSec / 60);
		const secs = Math.floor(totalSec % 60);
		const ms = Math.round((totalSec - Math.floor(totalSec)) * 1000);

		setTimeMinutes(String(mins));
		setTimeSeconds(String(secs).padStart(2, "0"));
		setTimeMilliseconds(String(ms).padStart(3, "0"));
		setTimePoints(timeRecord.points !== undefined ? String(timeRecord.points) : "");
		setTimeModalError(null);
		setTimeModalOpen(true);
	};

	// Save Time (Create or Update)
	const handleSaveTime = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedStation) return;
		setTimeModalError(null);

		if (timeTeamId === -1 || !teamMap.has(timeTeamId)) {
			setTimeModalError("Vælg venligst et hold");
			return;
		}

		const mins = parseInt(timeMinutes) || 0;
		const secs = parseInt(timeSeconds) || 0;
		const ms = parseInt(timeMilliseconds) || 0;
		const rawTotalSec = mins * 60 + secs + ms / 1000;

		if (rawTotalSec <= 0) {
			setTimeModalError("Tiden skal være større end 0 sekunder");
			return;
		}

		const pointsVal = timePoints.trim() !== "" ? parseFloat(timePoints) : undefined;

		setIsTimeSubmitting(true);
		try {
			if (editingTime) {
				const dto: UpdateStationTimeDTO = {
					timeSeconds: rawTotalSec,
					points: pointsVal,
				};
				await updateStationTime(editingTime.id, dto);
				showNotification("Tiden er opdateret!");
			} else {
				const dto: CreateStationTimeDTO = {
					eventId: numEventId,
					stationId: selectedStation.id,
					teamId: timeTeamId,
					timeSeconds: rawTotalSec,
					points: pointsVal,
				};
				await createStationTime(dto);
				showNotification("Tiden er registreret!");
			}
			setTimeModalOpen(false);
			const updatedTimes = await getStationTimes();
			setTimes(updatedTimes);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke gemme tidsregistrering";
			setTimeModalError(msg);
		} finally {
			setIsTimeSubmitting(false);
		}
	};

	// Delete Time Confirmation
	const handleDeleteTimeConfirm = async () => {
		if (!timeToDelete) return;
		setIsDeletingTime(true);
		try {
			await deleteStationTime(timeToDelete.id);
			showNotification("Tidsregistreringen er slettet.");
			setTimeToDelete(null);
			const updatedTimes = await getStationTimes();
			setTimes(updatedTimes);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke slette tid";
			showNotification(msg, "error");
		} finally {
			setIsDeletingTime(false);
		}
	};

	const formatDuration = (totalSeconds: number) => {
		const mins = Math.floor(totalSeconds / 60);
		const secs = Math.floor(totalSeconds % 60);
		const ms = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 100);
		return `${mins > 0 ? `${mins}m ` : ""}${secs}.${String(ms).padStart(2, "0")}s`;
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

			{/* Left Column: Stations Directory */}
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
							placeholder="Søg station eller placering..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={handleStartCreate}
						title="Opret ny station"
						className={cn(
							iconButton(),
							"bg-slate-900 text-white hover:bg-slate-800 border-transparent p-1.5"
						)}
					>
						<IconPlus size={18} />
					</button>
				</div>

				{/* Stations List */}
				<div className="flex-1 overflow-y-auto pr-0.5">
					{loading ? (
						<div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
							<IconLoader2 size={20} className="animate-spin" />
							<p className="text-xs">Henter stationer...</p>
						</div>
					) : filteredStations.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-slate-400 p-3 text-center">
							<IconFlag size={28} className="mb-1.5 opacity-30" />
							<p className="text-xs font-medium text-slate-600">Ingen stationer fundet</p>
							<p className="text-[11px] text-slate-400 mt-0.5">
								{stations.length === 0
									? "Der er endnu ikke oprettet stationer/poster til dette event."
									: "Prøv en anden søgning."}
							</p>
							<button
								onClick={handleStartCreate}
								className={cn(button(), "mt-2.5 text-xs py-1 px-2.5")}
							>
								<IconPlus size={14} /> Opret station
							</button>
						</div>
					) : (
						<ul className="flex flex-col gap-1.5">
							{filteredStations.map((station) => {
								const isSelected = selectedId === station.id && viewMode !== "CREATE";
								const stationTimesCount = times.filter((t) => t.stationId === station.id).length;

								return (
									<li key={station.id}>
										<button
											type="button"
											onClick={() => handleSelectStation(station)}
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
													<IconFlag size={16} />
												</div>
												<div className="min-w-0">
													<div className="font-medium text-xs truncate flex items-center gap-1.5">
														<span>{station.name}</span>
														{station.location && (
															<span
																className={cn(
																	"text-[10px] px-1 py-0.2 rounded font-normal truncate",
																	isSelected
																		? "bg-slate-800 text-slate-300"
																		: "bg-slate-100 text-slate-600"
																)}
															>
																{station.location}
															</span>
														)}
													</div>
													<div className="flex items-center gap-2 mt-0.5 text-[11px] opacity-60">
														<span className="font-mono">#{station.id}</span>
														<span className="ml-auto font-medium">
															{stationTimesCount} tider
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
														handleStartEdit(station);
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
														setStationToDelete(station);
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
					/* Create Station Form */
					<div className="max-w-xl mx-auto">
						<div className={cn(card(), "p-6")}>
							<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
								<div>
									<h2 className="text-lg font-bold text-slate-900">Opret ny station</h2>
									<p className="text-xs text-slate-500 mt-0.5">
										Opret en aktivitetspost til eventet. Der oprettes automatisk en tilknyttet postvagt-konto.
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
								{/* Name */}
								<div>
									<label
										htmlFor="new-station-name"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Stationsnavn *
									</label>
									<input
										id="new-station-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2 px-3 text-sm")}
										placeholder="f.eks. Post 1 - Murerhytten eller Forhindringsbane"
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* Location */}
								<div>
									<label
										htmlFor="new-station-location"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Placering / Lokation (valgfri)
									</label>
									<div className="relative flex items-center">
										<IconMapPin size={16} className="absolute left-3 text-slate-400" />
										<input
											id="new-station-location"
											type="text"
											className={cn(textField(), "w-full pl-9 pr-3 py-2 text-sm")}
											placeholder="f.eks. Bygning B, Værksted 3 eller Skolegården"
											value={formLocation}
											onChange={(e) => setFormLocation(e.target.value)}
										/>
									</div>
								</div>

								{/* Description */}
								<div>
									<label
										htmlFor="new-station-description"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Beskrivelse / Opgaveinstruks (valgfri)
									</label>
									<textarea
										id="new-station-description"
										rows={3}
										className={cn(textField(), "w-full py-2 px-3 text-sm resize-none")}
										placeholder="Kort instruks eller information til postvagten og holdene..."
										value={formDescription}
										onChange={(e) => setFormDescription(e.target.value)}
									/>
								</div>

								{/* Post Guard Account Info */}
								<div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
									<IconKey size={16} className="text-slate-500 shrink-0 mt-0.5" />
									<div>
										<p className="font-semibold text-slate-800">Automatisk Postvagt-Login</p>
										<p className="mt-0.5 text-slate-500">
											Der oprettes automatisk en postvagt-brugerkonto dedikeret til denne station.
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
										disabled={isSubmitting}
										className={cn(
											button(),
											"px-5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border-transparent flex items-center gap-1.5"
										)}
									>
										{isSubmitting && <IconLoader2 size={14} className="animate-spin" />}
										<span>Opret Station</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				) : viewMode === "EDIT" && selectedStation ? (
					/* Edit Station Form */
					<div className="max-w-xl mx-auto">
						<div className={cn(card(), "p-6")}>
							<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
								<div>
									<h2 className="text-lg font-bold text-slate-900">Rediger station</h2>
									<p className="text-xs text-slate-500 mt-0.5">
										Opdater oplysninger for {selectedStation.name}.
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
								{/* Name */}
								<div>
									<label
										htmlFor="edit-station-name"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Stationsnavn *
									</label>
									<input
										id="edit-station-name"
										type="text"
										required
										className={cn(textField(), "w-full py-2 px-3 text-sm")}
										value={formName}
										onChange={(e) => setFormName(e.target.value)}
									/>
								</div>

								{/* Location */}
								<div>
									<label
										htmlFor="edit-station-location"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Placering / Lokation
									</label>
									<div className="relative flex items-center">
										<IconMapPin size={16} className="absolute left-3 text-slate-400" />
										<input
											id="edit-station-location"
											type="text"
											className={cn(textField(), "w-full pl-9 pr-3 py-2 text-sm")}
											value={formLocation}
											onChange={(e) => setFormLocation(e.target.value)}
										/>
									</div>
								</div>

								{/* Description */}
								<div>
									<label
										htmlFor="edit-station-description"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Beskrivelse / Opgaveinstruks (valgfri)
									</label>
									<textarea
										id="edit-station-description"
										rows={3}
										className={cn(textField(), "w-full py-2 px-3 text-sm resize-none")}
										value={formDescription}
										onChange={(e) => setFormDescription(e.target.value)}
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
				) : selectedStation ? (
					/* View Station Details */
					<div className="max-w-4xl mx-auto space-y-4">
						{/* Station Header Card */}
						<div className={cn(card(), "p-5")}>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3.5">
									<div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold">
										<IconFlag size={22} />
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h2 className="text-xl font-bold text-slate-900">
												{selectedStation.name}
											</h2>
											{selectedStation.location && (
												<span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
													<IconMapPin size={13} />
													{selectedStation.location}
												</span>
											)}
										</div>
										<p className="text-xs text-slate-400 mt-0.5 font-mono">
											Station #{selectedStation.id} · Event #{activeEventId}
										</p>
									</div>
								</div>

								{/* Action buttons */}
								<div className="flex items-center gap-1.5">
									<button
										onClick={() => handleStartEdit(selectedStation)}
										className={cn(
											button(),
											"px-3 py-1.5 text-xs font-medium flex items-center gap-1 hover:border-slate-800"
										)}
									>
										<IconEdit size={14} /> Rediger
									</button>
									<button
										onClick={() => setStationToDelete(selectedStation)}
										className={cn(
											button(),
											"px-3 py-1.5 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 flex items-center gap-1"
										)}
									>
										<IconTrash size={14} /> Slet
									</button>
								</div>
							</div>

							{selectedStation.description && (
								<div className="mt-3.5 pt-3.5 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
									<IconFileDescription size={16} className="text-slate-400 shrink-0 mt-0.5" />
									<p className="leading-relaxed">{selectedStation.description}</p>
								</div>
							)}
						</div>

						{/* Station Guard Account Credentials Card */}
						{selectedAccount && (
							<div className={cn(card(), "p-5 space-y-3")}>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
											<IconKey size={16} className="text-slate-400" />
											<span>Tilknyttet Postvagt-Login</span>
										</h3>
										<p className="text-[11px] text-slate-400 mt-0.5">
											Konto til postvagten som styrer tidtagningen for denne station
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
												onClick={() => handleCopy(selectedAccount.username, "station_username")}
												title="Kopier brugernavn"
												className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
											>
												{copiedField === "station_username" ? (
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
													onClick={() => handleCopy(selectedAccount.password, "station_password")}
													title="Kopier kode"
													className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
												>
													{copiedField === "station_password" ? (
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

						{/* Station Times / Leaderboard Table */}
						<div className={cn(card(), "p-5 space-y-4")}>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
										<IconClock size={16} className="text-slate-500" />
										<span>Hold-Tider & Resultater ({stationTimes.length})</span>
									</h3>
									<p className="text-[11px] text-slate-400 mt-0.5">
										Oversigt over alle tider og scores registreret på denne station
									</p>
								</div>
								<button
									onClick={handleOpenAddTime}
									className={cn(
										button(),
										"text-xs py-1 px-2.5 bg-slate-900 text-white border-transparent hover:bg-slate-800 flex items-center gap-1"
									)}
								>
									<IconPlus size={13} /> Registrer tid
								</button>
							</div>

							{stationTimes.length === 0 ? (
								<div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center text-slate-400 text-xs">
									<IconClock size={24} className="mx-auto mb-1 opacity-40" />
									<p className="font-medium text-slate-600">Ingen tider registreret endnu</p>
									<p className="text-[11px] text-slate-400 mt-0.5">
										Når hold gennemfører stationen, vises deres tider og placeringer her.
									</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left text-xs border-collapse">
										<thead>
											<tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase tracking-wider">
												<th className="py-2.5 px-3 font-semibold w-12 text-center">Plac.</th>
												<th className="py-2.5 px-3 font-semibold">Hold</th>
												<th className="py-2.5 px-3 font-semibold">Klasse / Skole</th>
												<th className="py-2.5 px-3 font-semibold">Tid</th>
												<th className="py-2.5 px-3 font-semibold">Score / Point</th>
												<th className="py-2.5 px-3 font-semibold text-right">Handlinger</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-100">
											{stationTimes.map((record, index) => {
												const tm = teamMap.get(record.teamId);
												const cls = tm ? classMap.get(tm.classId) : null;
												const isLeader = index === 0;

												return (
													<tr
														key={record.id}
														className={cn(
															"hover:bg-slate-50/80 transition-colors",
															isLeader && "bg-slate-50/40 font-medium"
														)}
													>
														<td className="py-2 px-3 text-center">
															<span
																className={cn(
																	"inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-semibold",
																	index === 0
																		? "bg-slate-900 text-white"
																		: index === 1
																		? "bg-slate-200 text-slate-800"
																		: index === 2
																		? "bg-slate-100 text-slate-700"
																		: "text-slate-400"
																)}
															>
																{index + 1}
															</span>
														</td>
														<td className="py-2 px-3 font-medium text-slate-900">
															<div className="flex items-center gap-1.5">
																<span>{tm ? tm.name : `Hold #${record.teamId}`}</span>
															</div>
														</td>
														<td className="py-2 px-3 text-slate-500">
															{cls ? (
																<div className="flex flex-col">
																	<span>{cls.name}</span>
																	<span className="text-[10px] text-slate-400 truncate">
																		{cls.school}
																	</span>
																</div>
															) : (
																"-"
															)}
														</td>
														<td className="py-2 px-3 font-mono font-semibold text-slate-900">
															{formatDuration(record.timeSeconds)}
														</td>
														<td className="py-2 px-3 text-slate-600">
															{record.points !== undefined ? `${record.points} point` : "-"}
														</td>
														<td className="py-2 px-3 text-right">
															<div className="flex items-center justify-end gap-1">
																<button
																	type="button"
																	title="Rediger tid"
																	onClick={() => handleOpenEditTime(record)}
																	className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
																>
																	<IconEdit size={14} />
																</button>
																<button
																	type="button"
																	title="Slet tid"
																	onClick={() => setTimeToDelete(record)}
																	className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
																>
																	<IconTrash size={14} />
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
					<div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto text-center">
						<div className="w-14 h-14 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
							<IconFlag size={26} />
						</div>
						<h3 className="text-base font-bold text-slate-800">Ingen station valgt</h3>
						<p className="text-xs text-slate-500 mt-1 mb-4">
							Vælg en station fra listen til venstre for at se og redigere detaljerne, eller opret en ny station.
						</p>
						<button
							onClick={handleStartCreate}
							className={cn(
								button(),
								"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
							)}
						>
							<IconPlus size={16} /> Opret ny station
						</button>
					</div>
				)}
			</div>

			{/* Add / Edit Time Modal */}
			{timeModalOpen && selectedStation && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-100">
					<div className={cn(card(), "p-5 max-w-md w-full space-y-4")}>
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<div className="flex items-center gap-2">
								<div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center">
									<IconClock size={15} />
								</div>
								<div>
									<h3 className="font-bold text-sm text-slate-900">
										{editingTime ? "Rediger tidtagning" : "Registrer ny holdtid"}
									</h3>
									<p className="text-[11px] text-slate-500">{selectedStation.name}</p>
								</div>
							</div>
							<button
								onClick={() => setTimeModalOpen(false)}
								className="text-slate-400 hover:text-slate-600 p-1"
							>
								<IconX size={16} />
							</button>
						</div>

						{timeModalError && (
							<div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
								<IconAlertTriangle size={15} className="shrink-0" />
								<span>{timeModalError}</span>
							</div>
						)}

						<form onSubmit={handleSaveTime} className="space-y-3.5">
							{/* Select Team with SearchableSelect */}
							<div>
								<label
									htmlFor="time-modal-team"
									className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
								>
									Vælg Hold *
								</label>
								<SearchableSelect<number>
									id="time-modal-team"
									required
									disabled={editingTime !== null}
									value={timeTeamId !== -1 ? timeTeamId : null}
									onChange={(val) => setTimeTeamId(val)}
									options={teamSelectOptions}
									placeholder="Vælg eller søg hold..."
									leftIcon={<IconUsers size={16} />}
								/>
							</div>

							{/* Raw Time (Minutes, Seconds, Milliseconds) */}
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
									Gennemført Tid *
								</label>
								<div className="grid grid-cols-3 gap-2">
									<div>
										<label
											htmlFor="time-mins"
											className="block text-[10px] text-slate-400 font-semibold mb-0.5"
										>
											Minutter
										</label>
										<input
											id="time-mins"
											type="number"
											min={0}
											required
											className={cn(textField(), "w-full py-1.5 px-2 text-center text-xs font-mono")}
											value={timeMinutes}
											onChange={(e) => setTimeMinutes(e.target.value)}
										/>
									</div>
									<div>
										<label
											htmlFor="time-secs"
											className="block text-[10px] text-slate-400 font-semibold mb-0.5"
										>
											Sekunder
										</label>
										<input
											id="time-secs"
											type="number"
											min={0}
											max={59}
											required
											className={cn(textField(), "w-full py-1.5 px-2 text-center text-xs font-mono")}
											value={timeSeconds}
											onChange={(e) => setTimeSeconds(e.target.value)}
										/>
									</div>
									<div>
										<label
											htmlFor="time-ms"
											className="block text-[10px] text-slate-400 font-semibold mb-0.5"
										>
											Millisek.
										</label>
										<input
											id="time-ms"
											type="number"
											min={0}
											max={999}
											required
											className={cn(textField(), "w-full py-1.5 px-2 text-center text-xs font-mono")}
											value={timeMilliseconds}
											onChange={(e) => setTimeMilliseconds(e.target.value)}
										/>
									</div>
								</div>
							</div>

							{/* Score / Points */}
							<div>
								<label
									htmlFor="time-points"
									className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
								>
									Score / Point (valgfri)
								</label>
								<div className="relative flex items-center">
									<IconAdjustments size={15} className="absolute left-3 text-slate-400" />
									<input
										id="time-points"
										type="number"
										step="0.1"
										placeholder="f.eks. 85.5"
										className={cn(textField(), "w-full pl-8 pr-3 py-1.5 text-xs")}
										value={timePoints}
										onChange={(e) => setTimePoints(e.target.value)}
									/>
								</div>
							</div>

							{/* Modal Actions */}
							<div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setTimeModalOpen(false)}
									className={cn(
										button(),
										"px-3 py-1 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
									)}
								>
									Annuller
								</button>
								<button
									type="submit"
									disabled={isTimeSubmitting}
									className={cn(
										button(),
										"px-4 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border-transparent flex items-center gap-1.5"
									)}
								>
									{isTimeSubmitting && <IconLoader2 size={13} className="animate-spin" />}
									<span>{editingTime ? "Gem ændringer" : "Gem tid"}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal (Station) */}
			{stationToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-100">
					<div className={cn(card(), "p-5 max-w-md w-full space-y-3.5")}>
						<div className="flex items-center gap-2.5 text-red-600">
							<div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
								<IconTrash size={18} />
							</div>
							<div>
								<h3 className="font-bold text-sm text-slate-900">Slet station</h3>
								<p className="text-[11px] text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-xs text-slate-600">
							Er du sikker på, at du vil slette stationen{" "}
							<span className="font-semibold text-slate-900">&quot;{stationToDelete.name}&quot;</span>?
						</p>

						<div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
							<IconAlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
							<span>
								<strong>Advarsel:</strong> Sletning af denne station vil også slette den tilknyttede postvagt-konto samt alle registrerede tider for denne station!
							</span>
						</div>

						<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeleting}
								onClick={() => setStationToDelete(null)}
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
								<span>Slet station</span>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal (Time) */}
			{timeToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-100">
					<div className={cn(card(), "p-5 max-w-sm w-full space-y-3.5")}>
						<div className="flex items-center gap-2.5 text-red-600">
							<div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
								<IconTrash size={18} />
							</div>
							<div>
								<h3 className="font-bold text-sm text-slate-900">Slet tidsregistrering</h3>
								<p className="text-[11px] text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-xs text-slate-600">
							Er du sikker på, at du vil slette tiden på{" "}
							<span className="font-semibold text-slate-900">{formatDuration(timeToDelete.timeSeconds)}</span>?
						</p>

						<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeletingTime}
								onClick={() => setTimeToDelete(null)}
								className={cn(
									button(),
									"px-3 py-1 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
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
									"px-4 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 border-transparent flex items-center gap-1.5"
								)}
							>
								{isDeletingTime && <IconLoader2 size={13} className="animate-spin" />}
								<span>Slet tid</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
