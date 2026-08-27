"use client";

import { AdminShell } from "@/app/admin/shell";
import { cn } from "tailwind-variants";
import textField from "@/components/admin/TextField";
import { button } from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {
	createAccount,
	getAccounts,
	getClasses,
	getEvents,
	getSchools,
	getStations,
	getTeams,
	resetAccountPassword,
} from "@/libs/API";
import { generateRandomPassword, generateRandomUsername } from "@/libs/generators";
import AsyncDataRenderer from "@/components/DataComponent";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, type FormEvent } from "react";
import card from "@/components/admin/Card";
import { EventSelector } from "@/components/admin/EventSelector";
import { useSelectedEvent } from "@/hooks/useSelectedEvent";
import type { AccountModel, AccountRole } from "@/models/AccountModel";

// ── Role definitions & helpers ───────────────────────────────────────────────

const ROLE_INFO: Record<
	AccountRole,
	{ label: string; badgeClass: string; accessText: string; hasAdminAccess: boolean; desc: string }
> = {
	ORGANIZER: {
		label: "Arrangør",
		badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
		accessText: "Kontrol Center (Fuld adgang)",
		hasAdminAccess: true,
		desc: "Fuld adgang til kontrolcenteret. Oprettes kun manuelt af en anden arrangør.",
	},
	STATION_GUARD: {
		label: "Stationsvagt",
		badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
		accessText: "Stationsside (Ingen kontrol center)",
		hasAdminAccess: false,
		desc: "Tilknyttet en specifik post/station. Oprettes automatisk ved stationsoprettelse.",
	},
	TEAM_LEADER: {
		label: "Holdleder",
		badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
		accessText: "Holdlederside (Ingen kontrol center)",
		hasAdminAccess: false,
		desc: "Tilknyttet et specifikt hold. Oprettes automatisk med holdet.",
	},
	SHARED_TEAM: {
		label: "Fælles Holdkonto",
		badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
		accessText: "Holdside (Ingen kontrol center)",
		hasAdminAccess: false,
		desc: "Delt adgangskode til holdmedlemmer for visning af holdets statistikker.",
	},
};

// ── Creation dialog ──────────────────────────────────────────────────────────

interface CreateDialogProps {
	stations: StationModel[];
	teams: TeamModel[];
	onClose: () => void;
	onCreated: (account: AccountModel) => void;
}

function CreateAccountDialog({ stations, teams, onClose, onCreated }: CreateDialogProps) {
	const [role, setRole] = useState<AccountRole>("ORGANIZER");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState(generateRandomPassword(10));
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [stationId, setStationId] = useState<number>(stations[0]?.id ?? 0);
	const [teamId, setTeamId] = useState<number>(teams[0]?.id ?? 0);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleRoleChange(newRole: AccountRole) {
		setRole(newRole);
		if (newRole === "ORGANIZER") {
			setPassword(generateRandomPassword(10));
		} else if (newRole === "STATION_GUARD") {
			const st = stations.find((s) => s.id === stationId);
			setUsername(generateRandomUsername("vagt", st?.name));
			setPassword(`vagt-${generateRandomPassword(6)}`);
		} else if (newRole === "TEAM_LEADER") {
			const tm = teams.find((t) => t.id === teamId);
			setUsername(generateRandomUsername("leder", tm?.name));
			setPassword(`tl-${generateRandomPassword(6)}`);
		} else if (newRole === "SHARED_TEAM") {
			const tm = teams.find((t) => t.id === teamId);
			setUsername(generateRandomUsername("hold", tm?.name));
			setPassword(generateRandomPassword(4, true));
		}
	}

	function handleGeneratePassword() {
		if (role === "SHARED_TEAM") {
			setPassword(generateRandomPassword(4, true));
		} else if (role === "STATION_GUARD") {
			setPassword(`vagt-${generateRandomPassword(6)}`);
		} else if (role === "TEAM_LEADER") {
			setPassword(`tl-${generateRandomPassword(6)}`);
		} else {
			setPassword(generateRandomPassword(10));
		}
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!username.trim()) {
			setError("Brugernavn er påkrævet.");
			return;
		}
		if (!password.trim()) {
			setError("Adgangskode er påkrævet.");
			return;
		}

		if (role === "STATION_GUARD" && !stationId) {
			setError("Vælg en tilknyttet station.");
			return;
		}

		if ((role === "TEAM_LEADER" || role === "SHARED_TEAM") && !teamId) {
			setError("Vælg et tilknyttet hold.");
			return;
		}

		setSaving(true);
		setError(null);
		try {
			const created = await createAccount({
				role,
				username: username.trim(),
				password: password.trim(),
				name: name.trim() || undefined,
				email: email.trim() || undefined,
				stationId: role === "STATION_GUARD" ? Number(stationId) : undefined,
				teamId: role === "TEAM_LEADER" || role === "SHARED_TEAM" ? Number(teamId) : undefined,
			});
			onCreated(created);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Noget gik galt.");
			setSaving(false);
		}
	}

	return (
		<div
			className={"fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className={cn(card(), "bg-white p-6 sm:p-8 flex flex-col gap-4 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto")}>
				<div className={"flex items-center justify-between"}>
					<h2 className={"text-xl font-bold uppercase text-gray-900"}>Opret ny konto</h2>
					<span className={"text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-700"}>
						Manuel oprettelse
					</span>
				</div>

				<form onSubmit={handleSubmit} className={"flex flex-col gap-4"}>
					<div className={"flex flex-col gap-1"}>
						<label className={"text-xs font-semibold text-gray-600 uppercase"}>Kontotype / Rolle</label>
						<select
							className={cn(textField(), "cursor-pointer font-medium")}
							value={role}
							onChange={(e) => handleRoleChange(e.target.value as AccountRole)}
						>
							<option value="ORGANIZER">Arrangør (Fuld Kontrol Center Adgang)</option>
							<option value="STATION_GUARD">Stationsvagt (Stationstidtagning)</option>
							<option value="TEAM_LEADER">Holdleder (Holdledelse)</option>
							<option value="SHARED_TEAM">Fælles Holdkonto (Delt holdadgang)</option>
						</select>
						<p className={"text-xs text-gray-500 mt-0.5"}>{ROLE_INFO[role].desc}</p>
					</div>

					<div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
						<div className={"flex flex-col gap-1"}>
							<label className={"text-xs font-semibold text-gray-600 uppercase"}>Brugernavn</label>
							<input
								className={textField()}
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder={"f.eks. arrangor1 eller bruger"}
								autoFocus
							/>
						</div>

						<div className={"flex flex-col gap-1"}>
							<div className={"flex justify-between items-center"}>
								<label className={"text-xs font-semibold text-gray-600 uppercase"}>Adgangskode</label>
								<button
									type={"button"}
									onClick={handleGeneratePassword}
									className={"text-[11px] text-blue-600 hover:underline font-semibold"}
								>
									Generer ny
								</button>
							</div>
							<input
								className={textField()}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={"Adgangskode"}
							/>
						</div>
					</div>

					<div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
						<div className={"flex flex-col gap-1"}>
							<label className={"text-xs font-semibold text-gray-600 uppercase"}>Navn / Beskrivelse</label>
							<input
								className={textField()}
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={"f.eks. Oliver Arrangør"}
							/>
						</div>

						<div className={"flex flex-col gap-1"}>
							<label className={"text-xs font-semibold text-gray-600 uppercase"}>E-mail (valgfri)</label>
							<input
								type={"email"}
								className={textField()}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder={"navn@eksempel.dk"}
							/>
						</div>
					</div>

					{role === "STATION_GUARD" && (
						<div className={"flex flex-col gap-1 p-3 bg-amber-50/60 rounded-lg border border-amber-200"}>
							<label className={"text-xs font-semibold text-amber-900 uppercase"}>Tilknyttet station</label>
							<select
								className={cn(textField(), "bg-white cursor-pointer")}
								value={stationId}
								onChange={(e) => setStationId(Number(e.target.value))}
							>
								{stations.length === 0 ? (
									<option value={0}>Ingen stationer tilgængelige</option>
								) : (
									stations.map((st) => (
										<option key={st.id} value={st.id}>
											{st.name} (ID #{st.id})
										</option>
									))
								)}
							</select>
						</div>
					)}

					{(role === "TEAM_LEADER" || role === "SHARED_TEAM") && (
						<div className={"flex flex-col gap-1 p-3 bg-blue-50/60 rounded-lg border border-blue-200"}>
							<label className={"text-xs font-semibold text-blue-900 uppercase"}>Tilknyttet hold</label>
							<select
								className={cn(textField(), "bg-white cursor-pointer")}
								value={teamId}
								onChange={(e) => setTeamId(Number(e.target.value))}
							>
								{teams.length === 0 ? (
									<option value={0}>Ingen hold tilgængelige</option>
								) : (
									teams.map((tm) => (
										<option key={tm.id} value={tm.id}>
											{tm.name} (ID #{tm.id})
										</option>
									))
								)}
							</select>
						</div>
					)}

					{error && <p className={"text-red-500 text-sm"}>{error}</p>}

					<div className={"flex gap-2 justify-end pt-2"}>
						<button type={"button"} className={button({ shape: "pill" })} onClick={onClose} disabled={saving}>
							Annuller
						</button>
						<button
							type={"submit"}
							className={cn(button({ shape: "pill" }), "bg-hover text-white border-hover font-semibold")}
							disabled={saving}
						>
							{saving ? "Opretter..." : "Opret konto"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

// ── Accounts List Page ───────────────────────────────────────────────────────

export default function AccountsPage() {
	const {
		data: accounts,
		loading: loadingAccounts,
		error: errorAccounts,
		setData: setAccounts,
	} = useAsync<AccountModel[]>(getAccounts, []);

	const { data: events, loading: loadingEvents } = useAsync<EventModel[]>(getEvents, []);
	const { data: stations } = useAsync<StationModel[]>(getStations, []);
	const { data: classes } = useAsync<ClassModel[]>(getClasses, []);
	const { data: schools } = useAsync<SchoolModel[]>(getSchools, []);
	const { data: teams } = useAsync<TeamModel[]>(getTeams, []);

	const { selectedEventId, setSelectedEventId } = useSelectedEvent();

	const router = useRouter();
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [search, setSearch] = useState("");
	const [activeRoleFilter, setActiveRoleFilter] = useState<"ALL" | AccountRole>("ALL");
	const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
	const [copiedId, setCopiedId] = useState<number | null>(null);

	function togglePasswordVisibility(id: number) {
		setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
	}

	function handleCopyCredentials(account: AccountModel) {
		const text = `Brugernavn: ${account.username}\nAdgangskode: ${account.password}`;
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text);
			setCopiedId(account.id);
			setTimeout(() => setCopiedId(null), 2000);
		}
	}

	async function handleQuickResetPassword(id: number, e: React.MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		if (!confirm("Vil du generere en ny tilfældig adgangskode til denne konto?")) return;
		try {
			const res = await resetAccountPassword(id);
			setAccounts((prev) => prev?.map((a) => (a.id === id ? res.account : a)));
			setVisiblePasswords((prev) => ({ ...prev, [id]: true }));
		} catch (err) {
			alert(err instanceof Error ? err.message : "Kunne ikke nulstille adgangskode.");
		}
	}

	function getLinkedEntityInfo(account: AccountModel) {
		if (account.role === "ORGANIZER") {
			return {
				name: "Kontrol Center",
				sub: "Fuld systemadministrator",
				href: undefined,
				eventId: null,
			};
		}

		if (account.role === "STATION_GUARD" && account.stationId) {
			const station = stations?.find((s) => s.id === account.stationId);
			const event = events?.find((e) => e.id === station?.eventId);
			return {
				name: station?.name ?? `Station #${account.stationId}`,
				sub: event ? `Begivenhed: ${event.name}` : "Stationstidtagning",
				href: `/admin/stations/${account.stationId}`,
				eventId: station?.eventId ?? null,
			};
		}

		if ((account.role === "TEAM_LEADER" || account.role === "SHARED_TEAM") && account.teamId) {
			const team = teams?.find((t) => t.id === account.teamId);
			const cls = classes?.find((c) => c.id === team?.classId);
			const school = schools?.find((s) => s.id === cls?.schoolId);
			return {
				name: team?.name ?? `Hold #${account.teamId}`,
				sub: `${cls?.name ?? "Klasse"} • ${school?.name ?? "Skole"}`,
				href: `/admin/teams/${account.teamId}`,
				eventIds: cls?.eventIds ?? [],
			};
		}

		return {
			name: "Ikke tilknyttet",
			sub: "Ingen enhed",
			href: undefined,
			eventId: null,
		};
	}

	// Filter accounts by Event, Role, and Search
	const filteredAccounts = accounts?.filter((acc) => {
		// Role filter
		if (activeRoleFilter !== "ALL" && acc.role !== activeRoleFilter) {
			return false;
		}

		// Event filter
		if (selectedEventId !== null && acc.role !== "ORGANIZER") {
			const info = getLinkedEntityInfo(acc);
			if (acc.role === "STATION_GUARD") {
				if (info.eventId !== selectedEventId) return false;
			} else if (acc.role === "TEAM_LEADER" || acc.role === "SHARED_TEAM") {
				if (!info.eventIds?.includes(selectedEventId)) return false;
			}
		}

		// Search filter
		if (search.trim()) {
			const q = search.toLowerCase();
			const info = getLinkedEntityInfo(acc);
			const matchUsername = acc.username.toLowerCase().includes(q);
			const matchName = (acc.name ?? "").toLowerCase().includes(q);
			const matchEmail = (acc.email ?? "").toLowerCase().includes(q);
			const matchRole = ROLE_INFO[acc.role]?.label.toLowerCase().includes(q);
			const matchEntity = info.name.toLowerCase().includes(q) || info.sub.toLowerCase().includes(q);

			return matchUsername || matchName || matchEmail || matchRole || matchEntity;
		}

		return true;
	});

	function handleCreated(newAccount: AccountModel) {
		setAccounts((prev) => [...(prev ?? []), newAccount]);
		setShowCreateDialog(false);
		router.push(`/admin/accounts/${newAccount.id}`);
	}

	// Count statistics
	const totalAccounts = accounts?.length ?? 0;
	const organizerCount = accounts?.filter((a) => a.role === "ORGANIZER").length ?? 0;
	const guardCount = accounts?.filter((a) => a.role === "STATION_GUARD").length ?? 0;
	const leaderCount = accounts?.filter((a) => a.role === "TEAM_LEADER").length ?? 0;
	const sharedCount = accounts?.filter((a) => a.role === "SHARED_TEAM").length ?? 0;

	return (
		<AdminShell pageTitle={"Konti & Adgang"} currentPath={"/admin/accounts"}>
			<div className={"p-8 flex flex-col gap-6 max-w-6xl mx-auto w-full"}>
				{/* Event Selector Box */}
				<EventSelector
					events={events}
					selectedEventId={selectedEventId}
					onSelectEvent={setSelectedEventId}
					loading={loadingEvents}
				/>

				{/* Role Overview Stats Chips */}
				<div className={"grid grid-cols-2 sm:grid-cols-5 gap-3"}>
					<button
						onClick={() => setActiveRoleFilter("ALL")}
						className={cn(
							"p-3 rounded-xl border text-left transition-all cursor-pointer",
							activeRoleFilter === "ALL"
								? "bg-slate-800 text-white border-slate-900 shadow-sm"
								: "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
						)}
					>
						<p className={"text-xs font-semibold uppercase opacity-80"}>Alle Konti</p>
						<p className={"text-2xl font-bold mt-1"}>{totalAccounts}</p>
					</button>

					<button
						onClick={() => setActiveRoleFilter("ORGANIZER")}
						className={cn(
							"p-3 rounded-xl border text-left transition-all cursor-pointer",
							activeRoleFilter === "ORGANIZER"
								? "bg-purple-700 text-white border-purple-800 shadow-sm"
								: "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
						)}
					>
						<p className={"text-xs font-semibold uppercase opacity-80"}>Arrangører</p>
						<p className={"text-2xl font-bold mt-1 text-purple-700"}>{organizerCount}</p>
					</button>

					<button
						onClick={() => setActiveRoleFilter("STATION_GUARD")}
						className={cn(
							"p-3 rounded-xl border text-left transition-all cursor-pointer",
							activeRoleFilter === "STATION_GUARD"
								? "bg-amber-600 text-white border-amber-700 shadow-sm"
								: "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
						)}
					>
						<p className={"text-xs font-semibold uppercase opacity-80"}>Stationsvagter</p>
						<p className={"text-2xl font-bold mt-1 text-amber-600"}>{guardCount}</p>
					</button>

					<button
						onClick={() => setActiveRoleFilter("TEAM_LEADER")}
						className={cn(
							"p-3 rounded-xl border text-left transition-all cursor-pointer",
							activeRoleFilter === "TEAM_LEADER"
								? "bg-blue-600 text-white border-blue-700 shadow-sm"
								: "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
						)}
					>
						<p className={"text-xs font-semibold uppercase opacity-80"}>Holdledere</p>
						<p className={"text-2xl font-bold mt-1 text-blue-600"}>{leaderCount}</p>
					</button>

					<button
						onClick={() => setActiveRoleFilter("SHARED_TEAM")}
						className={cn(
							"p-3 rounded-xl border text-left transition-all cursor-pointer",
							activeRoleFilter === "SHARED_TEAM"
								? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
								: "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
						)}
					>
						<p className={"text-xs font-semibold uppercase opacity-80"}>Fælles Hold</p>
						<p className={"text-2xl font-bold mt-1 text-emerald-600"}>{sharedCount}</p>
					</button>
				</div>

				{/* Top Search & Actions Bar */}
				<div className={"flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"}>
					<div className={"flex-1 max-w-md"}>
						<input
							className={textField()}
							placeholder={"Søg efter brugernavn, navn, rolle, station, hold..."}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<button
						className={cn(
							button({ shape: "pill" }),
							"bg-hover text-white border-hover flex items-center justify-center gap-2 font-semibold shadow-sm"
						)}
						onClick={() => setShowCreateDialog(true)}
					>
						<span>+</span>
						<span>Opret arrangør / konto</span>
					</button>
				</div>

				{/* Table / List */}
				<div className={cn(card(), "bg-white overflow-hidden")}>
					<div className={"grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500"}>
						<span className={"col-span-3"}>Bruger / Navn</span>
						<span className={"col-span-2"}>Rolle</span>
						<span className={"col-span-3"}>Tilknytning</span>
						<span className={"col-span-2"}>Adgang</span>
						<span className={"col-span-2 text-right"}>Adgangskode</span>
					</div>

					<AsyncDataRenderer
						loading={loadingAccounts}
						error={errorAccounts}
						data={filteredAccounts ?? null}
						renderData={(accList) => {
							if (accList.length === 0) {
								return (
									<div className={"p-10 text-center text-gray-400 flex flex-col items-center gap-2"}>
										<span className={"text-2xl"}>👤</span>
										<p>Ingen konti matcher de valgte filtre</p>
									</div>
								);
							}

							return (
								<div className={"divide-y divide-gray-100"}>
									{accList.map((account) => {
										const roleMeta = ROLE_INFO[account.role] ?? ROLE_INFO.ORGANIZER;
										const entityInfo = getLinkedEntityInfo(account);
										const isPwVisible = !!visiblePasswords[account.id];
										const isCopied = copiedId === account.id;

										return (
											<div
												key={account.id}
												className={
													"grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/80 transition-colors"
												}
											>
												{/* Username & Name */}
												<div className={"col-span-3 flex flex-col min-w-0"}>
													<Link
														href={`/admin/accounts/${account.id}`}
														className={"font-semibold text-gray-900 hover:text-blue-600 truncate transition-colors flex items-center gap-1.5"}
													>
														<span>{account.username}</span>
														<span className={"text-gray-400 text-xs"}>→</span>
													</Link>
													<span className={"text-xs text-gray-500 truncate"}>
														{account.name || (account.email ? account.email : "Ingen navn angivet")}
													</span>
												</div>

												{/* Role */}
												<div className={"col-span-2 flex items-center"}>
													<span
														className={cn(
															"px-2.5 py-0.5 rounded-full text-xs font-semibold border",
															roleMeta.badgeClass
														)}
													>
														{roleMeta.label}
													</span>
												</div>

												{/* Linked Entity */}
												<div className={"col-span-3 flex flex-col min-w-0"}>
													{entityInfo.href ? (
														<Link
															href={entityInfo.href}
															className={"text-xs font-medium text-gray-800 hover:text-blue-600 truncate transition-colors"}
														>
															{entityInfo.name}
														</Link>
													) : (
														<span className={"text-xs font-medium text-gray-800 truncate"}>
															{entityInfo.name}
														</span>
													)}
													<span className={"text-[11px] text-gray-400 truncate"}>{entityInfo.sub}</span>
												</div>

												{/* Access Level */}
												<div className={"col-span-2 flex items-center"}>
													{roleMeta.hasAdminAccess ? (
														<span className={"px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"}>
															🔒 Kontrol Center
														</span>
													) : (
														<span className={"px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200"}>
															Ekstern portal
														</span>
													)}
												</div>

												{/* Password & Quick Actions */}
												<div className={"col-span-2 flex items-center justify-end gap-1.5"}>
													<div className={"flex items-center gap-1 bg-gray-100/90 rounded-md px-2 py-1 border border-gray-200 font-mono text-xs max-w-[130px]"}>
														<span className={"truncate"}>
															{isPwVisible ? account.password : "••••••••"}
														</span>
														<button
															type={"button"}
															onClick={() => togglePasswordVisibility(account.id)}
															title={isPwVisible ? "Skjul" : "Vis"}
															className={"text-gray-400 hover:text-gray-700 text-xs ml-auto pl-1"}
														>
															{isPwVisible ? "👁️" : "🙈"}
														</button>
													</div>

													<button
														type={"button"}
														onClick={() => handleCopyCredentials(account)}
														title={"Kopier bruger & kode"}
														className={cn(
															"p-1.5 rounded-md text-xs border transition-colors",
															isCopied
																? "bg-green-100 text-green-700 border-green-300"
																: "bg-white text-gray-500 hover:text-gray-800 border-gray-200 hover:bg-gray-100"
														)}
													>
														{isCopied ? "✓" : "📋"}
													</button>

													<button
														type={"button"}
														onClick={(e) => handleQuickResetPassword(account.id, e)}
														title={"Generer ny adgangskode"}
														className={"p-1.5 rounded-md text-xs bg-white text-gray-400 hover:text-amber-600 border border-gray-200 hover:bg-amber-50 transition-colors"}
													>
														🔄
													</button>
												</div>
											</div>
										);
									})}
								</div>
							);
						}}
					/>
				</div>
			</div>

			{showCreateDialog && (
				<CreateAccountDialog
					stations={stations ?? []}
					teams={teams ?? []}
					onClose={() => setShowCreateDialog(false)}
					onCreated={handleCreated}
				/>
			)}
		</AdminShell>
	);
}
