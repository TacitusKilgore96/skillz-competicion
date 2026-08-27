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
	IconEye,
	IconEyeOff,
	IconCopy,
	IconX,
	IconKey,
	IconShield,
	IconFlag,
	IconLoader2,
	IconAlertTriangle,
	IconCheck,
	IconUsers,
	IconArrowRight,
} from "@tabler/icons-react";
import { button, iconButton } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import {
	AccountModel,
	AccountType,
	CreateAccountDTO,
	UpdateAccountDTO,
} from "@/models/AccountModel";
import {
	getAccounts,
	createAccount,
	updateAccount,
	deleteAccount,
} from "@/libs/API";

interface AccountManagementProps {
	initialAccountId?: number | null;
	eventId?: string | string[];
}

type ViewMode = "VIEW" | "CREATE" | "EDIT";

export default function AccountManagement({
	initialAccountId,
	eventId,
}: AccountManagementProps) {
	const router = useRouter();
	const params = useParams();
	const activeEventId = eventId || params.eventId || "0";

	const [accounts, setAccounts] = useState<AccountModel[]>([]);
	const [loading, setLoading] = useState(true);

	const [selectedId, setSelectedId] = useState<number | null>(
		initialAccountId !== undefined && initialAccountId !== null ? initialAccountId : null
	);
	const [viewMode, setViewMode] = useState<ViewMode>("VIEW");
	const [typeFilter, setTypeFilter] = useState<string>("ALL");
	const [searchQuery, setSearchQuery] = useState("");

	// Form states
	const [formUsername, setFormUsername] = useState("");
	const [formPassword, setFormPassword] = useState("");
	const [formType, setFormType] = useState<AccountType>("POST_GUARD");
	const [formError, setFormError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Detail view visibility and copy feedback
	const [showPassword, setShowPassword] = useState(false);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Delete confirmation modal
	const [accountToDelete, setAccountToDelete] = useState<AccountModel | null>(
		null
	);
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

	const fetchAccounts = async (selectTargetId?: number | null) => {
		setLoading(true);
		try {
			const data = await getAccounts();
			setAccounts(data);
			if (selectTargetId !== undefined && selectTargetId !== null) {
				setSelectedId(selectTargetId);
			} else if (selectedId !== null) {
				const stillExists = data.some((a) => a.id === selectedId);
				if (!stillExists) {
					setSelectedId(data.length > 0 ? data[0].id : null);
				}
			} else if (data.length > 0 && initialAccountId === undefined) {
				setSelectedId(data[0].id);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke hente konti";
			showNotification(msg, "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAccounts(initialAccountId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialAccountId]);

	const selectedAccount = useMemo(() => {
		return accounts.find((a) => a.id === selectedId) || null;
	}, [accounts, selectedId]);

	// Filter accounts
	const filteredAccounts = useMemo(() => {
		return accounts.filter((account) => {
			const matchesType =
				typeFilter === "ALL" || account.type === typeFilter;
			const q = searchQuery.toLowerCase().trim();
			const matchesSearch =
				q === "" ||
				account.username.toLowerCase().includes(q) ||
				(account.type && account.type.toLowerCase().includes(q));
			return matchesType && matchesSearch;
		});
	}, [accounts, typeFilter, searchQuery]);

	const handleSelectAccount = (account: AccountModel) => {
		setSelectedId(account.id);
		setViewMode("VIEW");
		setShowPassword(false);
		setFormError(null);
		startTransition(() => {
			router.push(`/admin/${activeEventId}/accounts/${account.id}`);
		});
	};

	const handleStartCreate = () => {
		setViewMode("CREATE");
		setFormUsername("");
		setFormPassword("");
		setFormType("POST_GUARD");
		setFormError(null);
	};

	const handleStartEdit = (account: AccountModel) => {
		setSelectedId(account.id);
		setViewMode("EDIT");
		setFormUsername(account.username);
		setFormPassword(account.password);
		setFormType(account.type);
		setFormError(null);
	};

	const handleCancelForm = () => {
		setViewMode("VIEW");
		setFormError(null);
	};

	const handleSaveForm = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		const trimmedUsername = formUsername.trim();
		if (!trimmedUsername) {
			setFormError("Brugernavn er påkrævet");
			return;
		}
		if (!formPassword) {
			setFormError("Adgangskode er påkrævet");
			return;
		}

		setIsSubmitting(true);
		try {
			if (viewMode === "CREATE") {
				const dto: CreateAccountDTO = {
					username: trimmedUsername,
					password: formPassword,
					type: formType,
				};
				const created = await createAccount(dto);
				await fetchAccounts(created.id);
				setViewMode("VIEW");
				showNotification(`Kontoen '${created.username}' er oprettet!`);
				router.push(`/admin/${activeEventId}/accounts/${created.id}`);
			} else if (viewMode === "EDIT" && selectedAccount) {
				const dto: UpdateAccountDTO = {
					username: trimmedUsername,
					password: formPassword,
					type: formType,
				};
				const updated = await updateAccount(selectedAccount.id, dto);
				await fetchAccounts(updated.id);
				setViewMode("VIEW");
				showNotification(`Kontoen '${updated.username}' er opdateret!`);
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Handlingen mislykkedes";
			setFormError(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!accountToDelete) return;
		setIsDeleting(true);
		try {
			await deleteAccount(accountToDelete.id);
			showNotification(`Kontoen '${accountToDelete.username}' er slettet.`);
			setAccountToDelete(null);
			const remaining = accounts.filter((a) => a.id !== accountToDelete.id);
			setAccounts(remaining);
			if (selectedId === accountToDelete.id) {
				const nextSelected = remaining.length > 0 ? remaining[0].id : null;
				setSelectedId(nextSelected);
				if (nextSelected !== null) {
					router.push(`/admin/${activeEventId}/accounts/${nextSelected}`);
				} else {
					router.push(`/admin/${activeEventId}/accounts`);
				}
			}
			await fetchAccounts(selectedId === accountToDelete.id ? null : selectedId);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke slette konto";
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

			{/* Left Column: Accounts Directory */}
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
							className={cn(
								textField(),
								"w-full pl-9 pr-3 py-1.5 text-sm"
							)}
							placeholder="Søg i konti..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={handleStartCreate}
						title="Opret ny konto"
						className={cn(
							iconButton(),
							"bg-hover text-white hover:bg-emerald-600 border-transparent shadow-sm"
						)}
					>
						<IconPlus size={20} />
					</button>
				</div>

				{/* Filter Tabs */}
				<div className="flex p-1 bg-slate-100 rounded-xl gap-1 text-xs font-semibold">
					<button
						onClick={() => setTypeFilter("ALL")}
						className={cn(
							"flex-1 py-1.5 rounded-lg transition-all text-center",
							typeFilter === "ALL"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-500 hover:text-slate-800"
						)}
					>
						Alle ({accounts.length})
					</button>
					<button
						onClick={() => setTypeFilter("ORGANIZER")}
						className={cn(
							"flex-1 py-1.5 rounded-lg transition-all text-center",
							typeFilter === "ORGANIZER"
								? "bg-white text-indigo-700 shadow-xs"
								: "text-slate-500 hover:text-slate-800"
						)}
					>
						Arrangør
					</button>
					<button
						onClick={() => setTypeFilter("POST_GUARD")}
						className={cn(
							"flex-1 py-1.5 rounded-lg transition-all text-center",
							typeFilter === "POST_GUARD"
								? "bg-white text-emerald-700 shadow-xs"
								: "text-slate-500 hover:text-slate-800"
						)}
					>
						Postvagt
					</button>
					<button
						onClick={() => setTypeFilter("TEAM")}
						className={cn(
							"flex-1 py-1.5 rounded-lg transition-all text-center",
							typeFilter === "TEAM"
								? "bg-white text-amber-700 shadow-xs"
								: "text-slate-500 hover:text-slate-800"
						)}
					>
						Hold
					</button>
				</div>

				{/* Accounts List */}
				<div className="flex-1 overflow-y-auto pr-1">
					{loading ? (
						<div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
							<IconLoader2 size={24} className="animate-spin" />
							<p className="text-sm">Henter konti...</p>
						</div>
					) : filteredAccounts.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4 text-center">
							<IconKey size={32} className="mb-2 opacity-40" />
							<p className="text-sm font-medium">Ingen konti fundet</p>
							<p className="text-xs text-slate-400 mt-1">
								Prøv at ændre dine søgekriterier eller opret en ny konto.
							</p>
							<button
								onClick={handleStartCreate}
								className={cn(button(), "mt-3 text-xs flex items-center gap-1")}
							>
								<IconPlus size={14} /> Opret konto
							</button>
						</div>
					) : (
						<ul className="flex flex-col gap-2">
							{filteredAccounts.map((account) => {
								const isSelected =
									selectedId === account.id && viewMode !== "CREATE";
								return (
									<li key={account.id}>
										<button
											type="button"
											onClick={() => handleSelectAccount(account)}
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
														account.type === "ORGANIZER"
															? isSelected
																? "bg-indigo-500/30 text-indigo-200"
																: "bg-indigo-50 text-indigo-700"
															: account.type === "TEAM"
															? isSelected
																? "bg-amber-500/30 text-amber-200"
																: "bg-amber-50 text-amber-700"
															: isSelected
															? "bg-emerald-500/30 text-emerald-200"
															: "bg-emerald-50 text-emerald-700"
													)}
												>
													{account.type === "ORGANIZER" ? (
														<IconShield size={20} />
													) : account.type === "TEAM" ? (
														<IconUsers size={20} />
													) : (
														<IconFlag size={20} />
													)}
												</div>
												<div className="min-w-0">
													<div className="font-bold text-sm truncate flex items-center gap-2">
														<span>{account.username}</span>
														<span
															className={cn(
																"text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md",
																account.type === "ORGANIZER"
																	? isSelected
																		? "bg-indigo-400/20 text-indigo-300"
																		: "bg-indigo-100 text-indigo-800"
																	: account.type === "TEAM"
																	? isSelected
																		? "bg-amber-400/20 text-amber-300"
																		: "bg-amber-100 text-amber-800"
																	: isSelected
																	? "bg-emerald-400/20 text-emerald-300"
																	: "bg-emerald-100 text-emerald-800"
															)}
														>
															{account.type === "ORGANIZER"
																? "Arrangør"
																: account.type === "TEAM"
																? "Hold"
																: "Postvagt"}
														</span>
													</div>
													<div className="flex items-center gap-2 mt-0.5 text-xs opacity-75">
														<span className="font-mono text-[11px]">
															ID #{account.id}
														</span>
														{account.teamId && (
															<span className="text-[10px] text-amber-600 font-semibold truncate">
																Hold #{account.teamId}
															</span>
														)}
														{account.stationId && (
															<span className="text-[10px] text-emerald-600 font-semibold truncate">
																Station #{account.stationId}
															</span>
														)}
														<span
															className={cn(
																"text-[10px] tracking-widest font-mono",
																isSelected ? "text-slate-300" : "text-slate-400"
															)}
														>
															••••••••
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
														handleStartEdit(account);
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
														setAccountToDelete(account);
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
					/* Create Account Form */
					<div className="max-w-2xl mx-auto">
						<div className={cn(card(), "bg-white p-8 shadow-sm")}>
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-2xl font-bold text-slate-800">
										Opret ny brugerkonto
									</h2>
									<p className="text-sm text-slate-500 mt-1">
										Opret en arrangør-, postvagt- eller hold-konto med adgang til systemet.
									</p>
								</div>
								<button
									onClick={handleCancelForm}
									className={cn(
										iconButton(),
										"text-slate-400 hover:text-slate-600"
									)}
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
								{/* Role Selection */}
								<div>
									<label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
										Vælg Kontotype
									</label>
									<div className="grid grid-cols-2 gap-4">
										{/* POST_GUARD Option */}
										<label
											className={cn(
												"flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all",
												formType === "POST_GUARD"
													? "border-emerald-500 bg-emerald-50/50 shadow-sm"
													: "border-slate-200 bg-slate-50/50 hover:border-slate-300"
											)}
										>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
														<IconFlag size={18} />
													</div>
													<span className="font-bold text-slate-800">
														Postvagt
													</span>
												</div>
												<input
													type="radio"
													name="accountType"
													value="POST_GUARD"
													checked={formType === "POST_GUARD"}
													onChange={() => setFormType("POST_GUARD")}
													className="accent-emerald-600 w-4 h-4"
												/>
											</div>
											<p className="text-xs text-slate-500 mt-1">
												Adgang til post-/stationssiden for at registrere tider og point for deltagende hold.
											</p>
										</label>

										{/* ORGANIZER Option */}
										<label
											className={cn(
												"flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all",
												formType === "ORGANIZER"
													? "border-indigo-500 bg-indigo-50/50 shadow-sm"
													: "border-slate-200 bg-slate-50/50 hover:border-slate-300"
											)}
										>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
														<IconShield size={18} />
													</div>
													<span className="font-bold text-slate-800">
														Arrangør
													</span>
												</div>
												<input
													type="radio"
													name="accountType"
													value="ORGANIZER"
													checked={formType === "ORGANIZER"}
													onChange={() => setFormType("ORGANIZER")}
													className="accent-indigo-600 w-4 h-4"
												/>
											</div>
											<p className="text-xs text-slate-500 mt-1">
												Fuld administratoradgang til Kontrol Centeret, klasser, hold og alle konti.
											</p>
										</label>
									</div>
								</div>

								{/* Username Field */}
								<div>
									<label
										htmlFor="new-username"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Brugernavn *
									</label>
									<input
										id="new-username"
										type="text"
										required
										className={cn(textField(), "w-full py-2.5 px-4 text-sm")}
										placeholder="f.eks. post_trae_01"
										value={formUsername}
										onChange={(e) => setFormUsername(e.target.value)}
									/>
								</div>

								{/* Password Field */}
								<div>
									<label
										htmlFor="new-password"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Adgangskode *
									</label>
									<div className="relative flex items-center">
										<input
											id="new-password"
											type={showPassword ? "text" : "password"}
											required
											className={cn(
												textField(),
												"w-full py-2.5 pl-4 pr-12 text-sm"
											)}
											placeholder="Indtast adgangskode"
											value={formPassword}
											onChange={(e) => setFormPassword(e.target.value)}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
										>
											{showPassword ? (
												<IconEyeOff size={18} />
											) : (
												<IconEye size={18} />
											)}
										</button>
									</div>
								</div>

								{/* Action Buttons */}
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
										<span>Opret Konto</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				) : viewMode === "EDIT" && selectedAccount ? (
					/* Edit Account Form */
					<div className="max-w-2xl mx-auto">
						<div className={cn(card(), "bg-white p-8 shadow-sm")}>
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
								<div>
									<h2 className="text-2xl font-bold text-slate-800">
										Rediger konto
									</h2>
									<p className="text-sm text-slate-500 mt-1">
										Opdater oplysninger for bruger #{selectedAccount.id} ({selectedAccount.username}).
									</p>
								</div>
								<button
									onClick={handleCancelForm}
									className={cn(
										iconButton(),
										"text-slate-400 hover:text-slate-600"
									)}
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
								{/* Role Selection */}
								<div>
									<label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
										Kontotype
									</label>
									<div className="grid grid-cols-2 gap-4">
										<label
											className={cn(
												"flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all",
												formType === "POST_GUARD"
													? "border-emerald-500 bg-emerald-50/50 shadow-sm"
													: "border-slate-200 bg-slate-50/50 hover:border-slate-300"
											)}
										>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
														<IconFlag size={18} />
													</div>
													<span className="font-bold text-slate-800">
														Postvagt
													</span>
												</div>
												<input
													type="radio"
													name="accountType"
													value="POST_GUARD"
													checked={formType === "POST_GUARD"}
													onChange={() => setFormType("POST_GUARD")}
													className="accent-emerald-600 w-4 h-4"
												/>
											</div>
											<p className="text-xs text-slate-500 mt-1">
												Adgang til postvisningen for denne station.
											</p>
										</label>

										<label
											className={cn(
												"flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all",
												formType === "ORGANIZER"
													? "border-indigo-500 bg-indigo-50/50 shadow-sm"
													: "border-slate-200 bg-slate-50/50 hover:border-slate-300"
											)}
										>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
														<IconShield size={18} />
													</div>
													<span className="font-bold text-slate-800">
														Arrangør
													</span>
												</div>
												<input
													type="radio"
													name="accountType"
													value="ORGANIZER"
													checked={formType === "ORGANIZER"}
													onChange={() => setFormType("ORGANIZER")}
													className="accent-indigo-600 w-4 h-4"
												/>
											</div>
											<p className="text-xs text-slate-500 mt-1">
												Fuld kontrol over Kontrol Centeret.
											</p>
										</label>
									</div>
								</div>

								{/* Username Field */}
								<div>
									<label
										htmlFor="edit-username"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Brugernavn *
									</label>
									<input
										id="edit-username"
										type="text"
										required
										className={cn(textField(), "w-full py-2.5 px-4 text-sm")}
										value={formUsername}
										onChange={(e) => setFormUsername(e.target.value)}
									/>
								</div>

								{/* Password Field */}
								<div>
									<label
										htmlFor="edit-password"
										className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2"
									>
										Adgangskode *
									</label>
									<div className="relative flex items-center">
										<input
											id="edit-password"
											type={showPassword ? "text" : "password"}
											required
											className={cn(
												textField(),
												"w-full py-2.5 pl-4 pr-12 text-sm"
											)}
											value={formPassword}
											onChange={(e) => setFormPassword(e.target.value)}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
										>
											{showPassword ? (
												<IconEyeOff size={18} />
											) : (
												<IconEye size={18} />
											)}
										</button>
									</div>
								</div>

								{/* Action Buttons */}
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
				) : selectedAccount ? (
					/* View Account Details */
					<div className="max-w-2xl mx-auto space-y-6">
						{/* Account Overview Header */}
						<div className={cn(card(), "bg-white p-6 shadow-sm")}>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-4">
									<div
										className={cn(
											"w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-inner",
											selectedAccount.type === "ORGANIZER"
												? "bg-gradient-to-br from-indigo-600 to-indigo-800"
												: selectedAccount.type === "TEAM"
												? "bg-gradient-to-br from-amber-500 to-amber-700"
												: "bg-gradient-to-br from-emerald-600 to-emerald-800"
										)}
									>
										{selectedAccount.type === "ORGANIZER" ? (
											<IconShield size={32} />
										) : selectedAccount.type === "TEAM" ? (
											<IconUsers size={32} />
										) : (
											<IconFlag size={32} />
										)}
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h2 className="text-2xl font-bold text-slate-900">
												{selectedAccount.username}
											</h2>
											<span
												className={cn(
													"text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
													selectedAccount.type === "ORGANIZER"
														? "bg-indigo-100 text-indigo-800"
														: selectedAccount.type === "TEAM"
														? "bg-amber-100 text-amber-800"
														: "bg-emerald-100 text-emerald-800"
												)}
											>
												{selectedAccount.type === "ORGANIZER"
													? "Arrangør"
													: selectedAccount.type === "TEAM"
													? "Hold Login"
													: "Postvagt"}
											</span>
										</div>
										<p className="text-xs text-slate-400 mt-1 font-mono">
											Bruger ID #{selectedAccount.id}
										</p>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center gap-2">
									<button
										onClick={() => handleStartEdit(selectedAccount)}
										className={cn(
											button(),
											"px-4 py-1.5 text-sm font-semibold flex items-center gap-1.5 hover:border-slate-800"
										)}
									>
										<IconEdit size={16} /> Rediger
									</button>
									<button
										onClick={() => setAccountToDelete(selectedAccount)}
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

						{/* Credentials Details Card */}
						<div className={cn(card(), "bg-white p-6 shadow-sm space-y-4")}>
							<h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
								Login Oplysninger
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Username Field with Copy */}
								<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
									<div className="text-xs text-slate-400 font-semibold uppercase">
										Brugernavn
									</div>
									<div className="flex items-center justify-between mt-2">
										<span className="font-semibold text-slate-800 truncate text-base">
											{selectedAccount.username}
										</span>
										<button
											onClick={() =>
												handleCopy(selectedAccount.username, "username")
											}
											title="Kopier brugernavn"
											className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
										>
											{copiedField === "username" ? (
												<IconCheck size={16} className="text-emerald-600" />
											) : (
												<IconCopy size={16} />
											)}
										</button>
									</div>
								</div>

								{/* Password Field with Show/Hide & Copy */}
								<div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
									<div className="text-xs text-slate-400 font-semibold uppercase">
										Adgangskode
									</div>
									<div className="flex items-center justify-between mt-2">
										<span className="font-mono text-slate-800 text-base">
											{showPassword
												? selectedAccount.password
												: "••••••••"}
										</span>
										<div className="flex items-center gap-1">
											<button
												onClick={() =>
													setShowPassword(!showPassword)
												}
												title={showPassword ? "Skjul adgangskode" : "Vis adgangskode"}
												className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
											>
												{showPassword ? (
													<IconEyeOff size={16} />
												) : (
													<IconEye size={16} />
												)}
											</button>
											<button
												onClick={() =>
													handleCopy(
														selectedAccount.password,
														"password"
													)
												}
												title="Kopier adgangskode"
												className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
											>
												{copiedField === "password" ? (
													<IconCheck
														size={16}
														className="text-emerald-600"
													/>
												) : (
													<IconCopy size={16} />
												)}
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Role & Permissions Card */}
						<div className={cn(card(), "bg-white p-6 shadow-sm space-y-4")}>
							<h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
								Rolle & Tilladelser
							</h3>

							{selectedAccount.type === "ORGANIZER" ? (
								<div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
									<IconShield
										size={22}
										className="text-indigo-600 shrink-0 mt-0.5"
									/>
									<div className="text-sm text-indigo-900">
										<p className="font-semibold">
											Arrangør / Kontrolcenter Adgang
										</p>
										<p className="mt-1 text-xs text-indigo-700 leading-relaxed">
											Denne konto har fuld administratoradgang til konkurrencen. Arrangøren kan oprette og redigere begivenheder, tilknytte skoler og klasser, inddele elever i hold, opsætte stationer samt administrere øvrige brugerkonti.
										</p>
									</div>
								</div>
							) : selectedAccount.type === "TEAM" ? (
								<div className="space-y-3">
									<div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
										<IconUsers
											size={22}
											className="text-amber-600 shrink-0 mt-0.5"
										/>
										<div className="text-sm text-amber-900">
											<p className="font-semibold">Hold / Elev Fælleskonto</p>
											<p className="mt-1 text-xs text-amber-700 leading-relaxed">
												Delt elevlogin til holdet under konkurrencen. Når holdet logger ind første gang, vil de kunne vælge holdets endelige navn og holdbillede/avatar.
											</p>
										</div>
									</div>
									{selectedAccount.teamId && (
										<Link
											href={`/admin/${activeEventId}/teams/${selectedAccount.teamId}`}
											className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-800"
										>
											<div className="flex items-center gap-2">
												<IconUsers size={16} className="text-amber-600" />
												<span>Gå til tilknyttet hold #{selectedAccount.teamId}</span>
											</div>
											<IconArrowRight size={16} className="text-slate-400" />
										</Link>
									)}
								</div>
							) : (
								<div className="space-y-3">
									<div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
										<IconFlag
											size={22}
											className="text-emerald-600 shrink-0 mt-0.5"
										/>
										<div className="text-sm text-emerald-900">
											<p className="font-semibold">Postvagt / Stationsadgang</p>
											<p className="mt-1 text-xs text-emerald-700 leading-relaxed">
												Denne konto giver adgang til stationsvisningen for den tildelte post. Postvagten kan logge ind under konkurrencen for at se hold der ankommer til stationen, starte/stoppe tidtagning og indsende opnåede resultater.
											</p>
										</div>
									</div>
									{selectedAccount.stationId && (
										<Link
											href={`/admin/${activeEventId}/stations/${selectedAccount.stationId}`}
											className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-800"
										>
											<div className="flex items-center gap-2">
												<IconFlag size={16} className="text-emerald-600" />
												<span>Gå til tilknyttet station #{selectedAccount.stationId}</span>
											</div>
											<IconArrowRight size={16} className="text-slate-400" />
										</Link>
									)}
								</div>
							)}
						</div>
					</div>
				) : (
					/* Empty State when no accounts exist or none selected */
					<div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
						<div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
							<IconKey size={36} />
						</div>
						<h3 className="text-xl font-bold text-slate-800">
							Ingen konto valgt
						</h3>
						<p className="text-sm text-slate-500 mt-2 mb-6">
							Vælg en brugerkonto fra listen til venstre for at se eller redigere oplysninger, eller opret en ny konto.
						</p>
						<button
							onClick={handleStartCreate}
							className={cn(
								button(),
								"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-6 py-2 font-bold flex items-center gap-2"
							)}
						>
							<IconPlus size={18} /> Opret ny konto
						</button>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{accountToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
					<div
						className={cn(
							card(),
							"bg-white p-6 max-w-md w-full shadow-2xl space-y-4"
						)}
					>
						<div className="flex items-center gap-3 text-red-600">
							<div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
								<IconTrash size={22} />
							</div>
							<div>
								<h3 className="font-bold text-lg text-slate-900">
									Slet brugerkonto
								</h3>
								<p className="text-xs text-slate-500">
									Handlingen kan ikke fortrydes
								</p>
							</div>
						</div>

						<p className="text-sm text-slate-600">
							Er du sikker på, at du vil slette kontoen{" "}
							<span className="font-bold text-slate-900">
								&quot;{accountToDelete.username}&quot;
							</span>{" "}
							({accountToDelete.type === "ORGANIZER" ? "Arrangør" : accountToDelete.type === "TEAM" ? "Hold" : "Postvagt"})?
						</p>

						{accountToDelete.type === "TEAM" && (
							<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
								<IconAlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
								<span>
									<strong>Advarsel:</strong> Dette er en hold-konto. Sletning af denne konto vil automatisk slette det tilknyttede hold, da et hold ikke kan eksistere uden en konto!
								</span>
							</div>
						)}

						{accountToDelete.type === "POST_GUARD" && accountToDelete.stationId && (
							<div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
								<IconAlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
								<span>
									<strong>Advarsel:</strong> Dette er en postvagt-konto tilknyttet en station. Sletning af denne konto vil automatisk slette den tilknyttede station og alle dens tidsregistreringer!
								</span>
							</div>
						)}

						<div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeleting}
								onClick={() => setAccountToDelete(null)}
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
								{isDeleting && (
									<IconLoader2 size={16} className="animate-spin" />
								)}
								<span>Slet konto</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
