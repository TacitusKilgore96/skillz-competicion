"use client";

import { AdminShell } from "@/app/admin/shell";
import { cn } from "tailwind-variants";
import textField from "@/components/admin/TextField";
import { button } from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {
	deleteAccount,
	generateRandomPassword,
	getAccountById,
	getClasses,
	getEvents,
	getSchools,
	getStations,
	getTeams,
	updateAccount,
} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { use, useState, type FormEvent } from "react";
import card from "@/components/admin/Card";
import type { AccountModel, AccountRole } from "@/models/AccountModel";

// ── Role definitions & helpers ───────────────────────────────────────────────

const ROLE_INFO: Record<
	AccountRole,
	{ label: string; badgeClass: string; accessTitle: string; desc: string; accessLevel: string }
> = {
	ORGANIZER: {
		label: "Arrangør",
		badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
		accessTitle: "Kontrol Center (Fuld adgang)",
		desc: "Denne konto er en arrangør med fuld adgang til kontrolcenteret. Arrangører oprettes kun manuelt af andre arrangører og kan administrere begivenheder, skoler, klasser, hold, stationer og konti.",
		accessLevel: "Fuld adgang til alle kontrolcenter-funktioner og data.",
	},
	STATION_GUARD: {
		label: "Stationsvagt",
		badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
		accessTitle: "Stationsside (Ingen kontrol center adgang)",
		desc: "Denne konto er knyttet til en specifik station og oprettes automatisk ved oprettelse af en station. Kontoen har udelukkende adgang til at registrere tider på sin egen station og har IKKE adgang til Kontrol Centeret.",
		accessLevel: "Begrænset til stationens tidsregistrering.",
	},
	TEAM_LEADER: {
		label: "Holdleder",
		badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
		accessTitle: "Holdlederside (Ingen kontrol center adgang)",
		desc: "Denne konto er oprettet automatisk sammen med holdet til holdlederen/læreren. Kontoen har IKKE adgang til Kontrol Centeret.",
		accessLevel: "Begrænset til holdets lederoverflade.",
	},
	SHARED_TEAM: {
		label: "Fælles Holdkonto",
		badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
		accessTitle: "Fælles Holdside / Post (Ingen kontrol center adgang)",
		desc: "Denne konto deles mellem alle medlemmer på holdet og kræver blot adgangskode/PIN-kode ved posterne for at se deres statistikker. Kontoen har IKKE adgang til Kontrol Centeret.",
		accessLevel: "Begrænset til visning af egne holdstatistikker og tider på poster.",
	},
};

// ── Edit Form Component ──────────────────────────────────────────────────────

interface EditFormProps {
	account: AccountModel;
	events: EventModel[];
	stations: StationModel[];
	classes: ClassModel[];
	schools: SchoolModel[];
	teams: TeamModel[];
	onUpdated: (account: AccountModel) => void;
	onDeleted: () => void;
}

function EditForm({
	account,
	events,
	stations,
	classes,
	schools,
	teams,
	onUpdated,
	onDeleted,
}: EditFormProps) {
	const [role, setRole] = useState<AccountRole>(account.role);
	const [username, setUsername] = useState(account.username);
	const [password, setPassword] = useState(account.password);
	const [name, setName] = useState(account.name ?? "");
	const [email, setEmail] = useState(account.email ?? "");
	const [stationId, setStationId] = useState<number>(account.stationId ?? (stations[0]?.id ?? 0));
	const [teamId, setTeamId] = useState<number>(account.teamId ?? (teams[0]?.id ?? 0));

	const [showPassword, setShowPassword] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [copied, setCopied] = useState(false);

	const isDirty =
		role !== account.role ||
		username !== account.username ||
		password !== account.password ||
		name !== (account.name ?? "") ||
		email !== (account.email ?? "") ||
		(role === "STATION_GUARD" && stationId !== (account.stationId ?? 0)) ||
		((role === "TEAM_LEADER" || role === "SHARED_TEAM") && teamId !== (account.teamId ?? 0));

	function handleGeneratePassword() {
		let newPw = "";
		if (role === "SHARED_TEAM") {
			newPw = generateRandomPassword(4, true);
		} else if (role === "STATION_GUARD") {
			newPw = `vagt-${generateRandomPassword(6)}`;
		} else if (role === "TEAM_LEADER") {
			newPw = `tl-${generateRandomPassword(6)}`;
		} else {
			newPw = generateRandomPassword(10);
		}
		setPassword(newPw);
		setShowPassword(true);
		setSaved(false);
	}

	function handleCopyCredentials() {
		const text = `Brugernavn: ${username}\nAdgangskode: ${password}\nRolle: ${ROLE_INFO[role]?.label}`;
		if (navigator.clipboard) {
			navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!username.trim()) {
			setSaveError("Brugernavn er påkrævet.");
			return;
		}
		if (!password.trim()) {
			setSaveError("Adgangskode er påkrævet.");
			return;
		}

		setSaving(true);
		setSaveError(null);
		setSaved(false);

		try {
			const updated = await updateAccount(account.id, {
				role,
				username: username.trim(),
				password: password.trim(),
				name: name.trim() || undefined,
				email: email.trim() || undefined,
				stationId: role === "STATION_GUARD" ? Number(stationId) : undefined,
				teamId: role === "TEAM_LEADER" || role === "SHARED_TEAM" ? Number(teamId) : undefined,
			});
			setSaved(true);
			onUpdated(updated);
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : "Noget gik galt ved gem.");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (
			!confirm(
				`Er du sikker på, at du vil slette kontoen "${account.username}"? Denne handling kan ikke fortrydes.`
			)
		) {
			return;
		}

		setDeleting(true);
		setSaveError(null);
		try {
			await deleteAccount(account.id);
			onDeleted();
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : "Noget gik galt ved sletning.");
			setDeleting(false);
		}
	}

	// Related entity details
	const linkedStation = stations.find((s) => s.id === (role === "STATION_GUARD" ? stationId : account.stationId));
	const linkedStationEvent = events.find((e) => e.id === linkedStation?.eventId);

	const linkedTeam = teams.find(
		(t) => t.id === (role === "TEAM_LEADER" || role === "SHARED_TEAM" ? teamId : account.teamId)
	);
	const linkedTeamClass = classes.find((c) => c.id === linkedTeam?.classId);
	const linkedTeamSchool = schools.find((s) => s.id === linkedTeamClass?.schoolId);
	const linkedTeamEvents = events.filter((e) => linkedTeamClass?.eventIds?.includes(e.id));

	const roleMeta = ROLE_INFO[role] ?? ROLE_INFO.ORGANIZER;

	return (
		<div className={"flex flex-col gap-6"}>
			{/* Top Header Card */}
			<div className={cn(card(), "bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4")}>
				<div className={"flex flex-col gap-1"}>
					<div className={"flex items-center gap-3"}>
						<h2 className={"text-2xl font-bold text-gray-900"}>{account.username}</h2>
						<span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", roleMeta.badgeClass)}>
							{roleMeta.label}
						</span>
						{role === "ORGANIZER" ? (
							<span className={"px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"}>
								🔒 Kontrol Center Adgang
							</span>
						) : (
							<span className={"px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"}>
								Ekstern portal (Ingen Kontrol Center)
							</span>
						)}
					</div>
					<p className={"text-sm text-gray-500"}>
						Konto ID #{account.id} {account.createdAt ? `• Oprettet ${account.createdAt}` : ""}
					</p>
				</div>

				<div className={"flex items-center gap-2"}>
					<button
						type={"button"}
						onClick={handleCopyCredentials}
						className={cn(
							button({ shape: "pill" }),
							"text-xs flex items-center gap-1.5 transition-colors",
							copied ? "bg-green-100 text-green-700 border-green-300" : "bg-white text-gray-700 hover:bg-gray-50"
						)}
					>
						<span>{copied ? "✓" : "📋"}</span>
						<span>{copied ? "Kopieret til udklipsholder" : "Kopier loginoplysninger"}</span>
					</button>
				</div>
			</div>

			{/* Role Information Banner */}
			<div
				className={cn(
					"p-4 rounded-xl border flex flex-col gap-1 text-sm",
					role === "ORGANIZER"
						? "bg-purple-50/70 border-purple-200 text-purple-900"
						: role === "STATION_GUARD"
						? "bg-amber-50/70 border-amber-200 text-amber-900"
						: role === "TEAM_LEADER"
						? "bg-blue-50/70 border-blue-200 text-blue-900"
						: "bg-emerald-50/70 border-emerald-200 text-emerald-900"
				)}
			>
				<div className={"flex items-center gap-2 font-bold"}>
					<span>ℹ️ Om denne kontotype:</span>
					<span>{roleMeta.accessTitle}</span>
				</div>
				<p className={"opacity-90"}>{roleMeta.desc}</p>
				<p className={"text-xs opacity-75 mt-1 font-medium"}>Adgangsniveau: {roleMeta.accessLevel}</p>
			</div>

			{/* Main Form */}
			<form onSubmit={handleSubmit} className={cn(card(), "bg-white p-6 sm:p-8 flex flex-col gap-6")}>
				<h3 className={"text-lg font-bold uppercase text-gray-800 border-b border-gray-100 pb-3"}>
					Rediger kontooplysninger
				</h3>

				<div className={"grid grid-cols-1 sm:grid-cols-2 gap-6"}>
					{/* Username */}
					<div className={"flex flex-col gap-1.5"}>
						<label className={"text-xs font-semibold text-gray-600 uppercase"}>Brugernavn</label>
						<input
							className={textField()}
							value={username}
							onChange={(e) => {
								setUsername(e.target.value);
								setSaved(false);
							}}
							placeholder={"Brugernavn"}
							required
						/>
					</div>

					{/* Role */}
					<div className={"flex flex-col gap-1.5"}>
						<label className={"text-xs font-semibold text-gray-600 uppercase"}>Rolle / Kontotype</label>
						<select
							className={cn(textField(), "cursor-pointer font-medium")}
							value={role}
							onChange={(e) => {
								setRole(e.target.value as AccountRole);
								setSaved(false);
							}}
						>
							<option value="ORGANIZER">Arrangør (Fuld Kontrol Center Adgang)</option>
							<option value="STATION_GUARD">Stationsvagt (Stationstidtagning)</option>
							<option value="TEAM_LEADER">Holdleder (Holdledelse)</option>
							<option value="SHARED_TEAM">Fælles Holdkonto (Delt holdadgang)</option>
						</select>
					</div>
				</div>

				{/* Password Field with Generator */}
				<div className={"flex flex-col gap-1.5 p-4 bg-gray-50/70 rounded-xl border border-gray-200"}>
					<div className={"flex items-center justify-between"}>
						<label className={"text-xs font-semibold text-gray-700 uppercase flex items-center gap-1.5"}>
							<span>🔑</span>
							<span>Adgangskode {role === "SHARED_TEAM" ? "(PIN / Delt kode)" : ""}</span>
						</label>

						<button
							type={"button"}
							onClick={handleGeneratePassword}
							className={"text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"}
						>
							<span>🔄</span>
							<span>Generer ny tilfældig adgangskode</span>
						</button>
					</div>

					<div className={"flex items-center gap-2 mt-1"}>
						<input
							type={showPassword ? "text" : "password"}
							className={cn(textField(), "bg-white font-mono flex-1")}
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								setSaved(false);
							}}
							placeholder={"Indtast adgangskode"}
							required
						/>

						<button
							type={"button"}
							onClick={() => setShowPassword((p) => !p)}
							className={cn(button({ shape: "pill" }), "text-xs px-3 bg-white shrink-0")}
						>
							{showPassword ? "Skjul 🙈" : "Vis 👁️"}
						</button>
					</div>
					<p className={"text-xs text-gray-500"}>
						{role === "SHARED_TEAM"
							? "For fælles holdkonti anvendes denne kode direkte ved posterne for at få adgang til holdets data."
							: "Brugeren anvender dette brugernavn og adgangskode ved login."}
					</p>
				</div>

				{/* Name & Email */}
				<div className={"grid grid-cols-1 sm:grid-cols-2 gap-6"}>
					<div className={"flex flex-col gap-1.5"}>
						<label className={"text-xs font-semibold text-gray-600 uppercase"}>Navn / Beskrivelse</label>
						<input
							className={textField()}
							value={name}
							onChange={(e) => {
								setName(e.target.value);
								setSaved(false);
							}}
							placeholder={"f.eks. Oliver Arrangør eller Holdleder Hansen"}
						/>
					</div>

					<div className={"flex flex-col gap-1.5"}>
						<label className={"text-xs font-semibold text-gray-600 uppercase"}>E-mail</label>
						<input
							type={"email"}
							className={textField()}
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								setSaved(false);
							}}
							placeholder={"f.eks. kontakt@skills.dk"}
						/>
					</div>
				</div>

				{/* Linked Entity Settings */}
				{role === "STATION_GUARD" && (
					<div className={"flex flex-col gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-200/80"}>
						<label className={"text-xs font-bold text-amber-950 uppercase"}>Tilknyttet station</label>
						<select
							className={cn(textField(), "bg-white cursor-pointer font-medium")}
							value={stationId}
							onChange={(e) => {
								setStationId(Number(e.target.value));
								setSaved(false);
							}}
						>
							{stations.length === 0 ? (
								<option value={0}>Ingen stationer tilgængelige</option>
							) : (
								stations.map((st) => {
									const ev = events.find((e) => e.id === st.eventId);
									return (
										<option key={st.id} value={st.id}>
											{st.name} (Begivenhed: {ev?.name ?? `#${st.eventId}`})
										</option>
									);
								})
							)}
						</select>

						{linkedStation && (
							<div className={"flex items-center justify-between text-xs text-amber-900 pt-1"}>
								<span>
									Nuværende tilknytning: <strong>{linkedStation.name}</strong> • Begivenhed:{" "}
									<strong>{linkedStationEvent?.name ?? `#${linkedStation.eventId}`}</strong>
								</span>
								<Link
									href={`/admin/stations/${linkedStation.id}`}
									className={"font-semibold text-blue-600 hover:underline"}
								>
									Se station →
								</Link>
							</div>
						)}
					</div>
				)}

				{(role === "TEAM_LEADER" || role === "SHARED_TEAM") && (
					<div className={"flex flex-col gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-200/80"}>
						<label className={"text-xs font-bold text-blue-950 uppercase"}>Tilknyttet hold</label>
						<select
							className={cn(textField(), "bg-white cursor-pointer font-medium")}
							value={teamId}
							onChange={(e) => {
								setTeamId(Number(e.target.value));
								setSaved(false);
							}}
						>
							{teams.length === 0 ? (
								<option value={0}>Ingen hold tilgængelige</option>
							) : (
								teams.map((tm) => {
									const cl = classes.find((c) => c.id === tm.classId);
									const sc = schools.find((s) => s.id === cl?.schoolId);
									return (
										<option key={tm.id} value={tm.id}>
											{tm.name} ({cl?.name ?? "Klasse"} • {sc?.name ?? "Skole"})
										</option>
									);
								})
							)}
						</select>

						{linkedTeam && (
							<div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-blue-900 pt-1"}>
								<span>
									Nuværende tilknytning: <strong>{linkedTeam.name}</strong> (
									{linkedTeamClass?.name ?? "Klasse"} • {linkedTeamSchool?.name ?? "Skole"}
									{linkedTeamEvents.length > 0 ? ` • Begivenheder: ${linkedTeamEvents.map((e) => e.name).join(", ")}` : ""})
								</span>
								<Link href={`/admin/teams/${linkedTeam.id}`} className={"font-semibold text-blue-600 hover:underline"}>
									Se hold →
								</Link>
							</div>
						)}
					</div>
				)}

				{saveError && <p className={"text-red-500 text-sm"}>{saveError}</p>}
				{saved && <p className={"text-emerald-600 text-sm font-semibold"}>✓ Ændringerne er gemt!</p>}

				{/* Action Buttons */}
				<div className={"flex items-center justify-between pt-4 border-t border-gray-100"}>
					<button
						type={"button"}
						className={cn(
							button({ shape: "pill" }),
							"bg-red-50 text-red-600 border-red-200 hover:bg-red-100 text-sm font-semibold"
						)}
						onClick={handleDelete}
						disabled={deleting || saving}
					>
						{deleting ? "Sletter..." : "Slet konto"}
					</button>

					<button
						type={"submit"}
						className={cn(
							button({ shape: "pill" }),
							"bg-hover text-white border-hover font-semibold",
							!isDirty && "opacity-50 cursor-not-allowed"
						)}
						disabled={saving || !isDirty}
					>
						{saving ? "Gemmer..." : "Gem ændringer"}
					</button>
				</div>
			</form>
		</div>
	);
}

// ── Account Detail / Edit Page ───────────────────────────────────────────────

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const resolvedParams = use(params);
	const accountId = parseInt(resolvedParams.id, 10);
	const router = useRouter();

	const {
		data: account,
		loading: loadingAccount,
		error: errorAccount,
		setData: setAccount,
	} = useAsync<AccountModel | undefined>(() => getAccountById(accountId), [accountId]);

	const { data: events } = useAsync<EventModel[]>(getEvents, []);
	const { data: stations } = useAsync<StationModel[]>(getStations, []);
	const { data: classes } = useAsync<ClassModel[]>(getClasses, []);
	const { data: schools } = useAsync<SchoolModel[]>(getSchools, []);
	const { data: teams } = useAsync<TeamModel[]>(getTeams, []);

	function handleUpdated(updated: AccountModel) {
		setAccount(updated);
	}

	function handleDeleted() {
		router.push("/admin/accounts");
	}

	return (
		<AdminShell pageTitle={"Konto Detaljer"} currentPath={"/admin/accounts"}>
			<div className={"p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full"}>
				{/* Top Navigation */}
				<div className={"flex items-center justify-between"}>
					<Link
						href={"/admin/accounts"}
						className={"text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"}
					>
						<span>←</span>
						<span>Tilbage til konti</span>
					</Link>
				</div>

				<AsyncDataRenderer
					loading={loadingAccount}
					error={errorAccount}
					data={account ?? null}
					renderData={(acc) => {
						if (!acc) {
							return (
								<div className={cn(card(), "bg-white p-8 text-center text-gray-500")}>
									<p className={"font-semibold text-lg"}>Kontoen blev ikke fundet</p>
									<Link href={"/admin/accounts"} className={"text-blue-600 underline text-sm mt-2 block"}>
										Gå tilbage til kontooversigten
									</Link>
								</div>
							);
						}

						return (
							<EditForm
								account={acc}
								events={events ?? []}
								stations={stations ?? []}
								classes={classes ?? []}
								schools={schools ?? []}
								teams={teams ?? []}
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
