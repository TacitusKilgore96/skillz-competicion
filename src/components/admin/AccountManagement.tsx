"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
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
	IconEye,
	IconEyeOff,
	IconCopy,
	IconShieldCheck,
	IconKey,
	IconUsers,
	IconFlag,
	IconUser,
} from "@tabler/icons-react";
import { button, iconButton } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import { AccountModel, AccountType, CreateAccountDTO, UpdateAccountDTO } from "@/models/AccountModel";
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
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("ALL");

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

	const fetchAccounts = async (selectTargetId?: number | null, isInitial = false) => {
		if (isInitial && accounts.length === 0) {
			setLoading(true);
		}
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

	// Initial fetch on mount
	useEffect(() => {
		fetchAccounts(initialAccountId, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sync selectedId when initialAccountId changes externally without refetching full list
	useEffect(() => {
		if (initialAccountId !== undefined && initialAccountId !== null) {
			setSelectedId(initialAccountId);
		}
	}, [initialAccountId]);

	const selectedAccount = useMemo(() => {
		return accounts.find((a) => a.id === selectedId) || null;
	}, [accounts, selectedId]);

	// Filtered accounts list
	const filteredAccounts = useMemo(() => {
		return accounts.filter((account) => {
			const matchesType =
				typeFilter === "ALL" ? true : account.type === typeFilter;
			const matchesQuery =
				searchQuery.trim() === "" ||
				account.username
					.toLowerCase()
					.includes(searchQuery.toLowerCase().trim());
			return matchesType && matchesQuery;
		});
	}, [accounts, typeFilter, searchQuery]);

	const handleSelectAccount = (account: AccountModel) => {
		setSelectedId(account.id);
		setViewMode("VIEW");
		setFormError(null);
		setShowPassword(false);
		window.history.replaceState(null, "", `/admin/${activeEventId}/accounts/${account.id}`);
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
				window.history.replaceState(null, "", `/admin/${activeEventId}/accounts/${created.id}`);
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
					window.history.replaceState(null, "", `/admin/${activeEventId}/accounts/${nextSelected}`);
				} else {
					window.history.replaceState(null, "", `/admin/${activeEventId}/accounts`);
				}
			}
			await fetchAccounts(selectedId === accountToDelete.id ? null : selectedId);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Kunne ikke slette kontoen";
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

	const getTypeBadge = (type: AccountType) => {
		switch (type) {
			case "ORGANIZER":
				return (
					<span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-900 text-white">
						Arrangør
					</span>
				);
			case "POST_GUARD":
				return (
					<span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
						Postvagt
					</span>
				);
			case "TEAM":
				return (
					<span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
						Hold
					</span>
				);
		}
	};

	const getTypeIcon = (type: AccountType) => {
		switch (type) {
			case "ORGANIZER":
				return <IconShieldCheck size={16} />;
			case "POST_GUARD":
				return <IconFlag size={16} />;
			case "TEAM":
				return <IconUsers size={16} />;
		}
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

			{/* Left Column: Account Directory */}
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
							placeholder="Søg brugernavn..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={handleStartCreate}
						title="Opret ny konto"
						className={cn(
							iconButton(),
							"bg-slate-900 text-white hover:bg-slate-800 border-transparent p-1.5"
						)}
					>
						<IconPlus size={18} />
					</button>
				</div>

				{/* Role Filter Tabs */}
				<div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
					<button
						onClick={() => setTypeFilter("ALL")}
						className={cn(
							"flex-1 py-1 rounded text-center font-medium transition-colors text-[11px]",
							typeFilter === "ALL"
								? "bg-white text-slate-900 border border-slate-200/80"
								: "text-slate-600 hover:text-slate-900"
						)}
					>
						Alle
					</button>
					<button
						onClick={() => setTypeFilter("POST_GUARD")}
						className={cn(
							"flex-1 py-1 rounded text-center font-medium transition-colors text-[11px]",
							typeFilter === "POST_GUARD"
								? "bg-white text-slate-900 border border-slate-200/80"
								: "text-slate-600 hover:text-slate-900"
						)}
					>
						Postvagter
					</button>
					<button
						onClick={() => setTypeFilter("TEAM")}
						className={cn(
							"flex-1 py-1 rounded text-center font-medium transition-colors text-[11px]",
							typeFilter === "TEAM"
								? "bg-white text-slate-900 border border-slate-200/80"
								: "text-slate-600 hover:text-slate-900"
						)}
					>
						Hold
					</button>
					<button
						onClick={() => setTypeFilter("ORGANIZER")}
						className={cn(
							"flex-1 py-1 rounded text-center font-medium transition-colors text-[11px]",
							typeFilter === "ORGANIZER"
								? "bg-white text-slate-900 border border-slate-200/80"
								: "text-slate-600 hover:text-slate-900"
						)}
					>
						Arrangører
					</button>
				</div>

				{/* Account List */}
				<div className="flex-1 overflow-y-auto pr-0.5">
					{loading && accounts.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
							<IconLoader2 size={20} className="animate-spin" />
							<p className="text-xs">Henter konti...</p>
						</div>
					) : filteredAccounts.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-slate-400 p-3 text-center">
							<IconKey size={28} className="mb-1.5 opacity-30" />
							<p className="text-xs font-medium text-slate-600">Ingen konti fundet</p>
							<p className="text-[11px] text-slate-400 mt-0.5">
								{accounts.length === 0
									? "Der er endnu ikke oprettet nogen konti."
									: "Prøv et andet filter eller en anden søgning."}
							</p>
							<button
								onClick={handleStartCreate}
								className={cn(button(), "mt-2.5 text-xs py-1 px-2.5")}
							>
								<IconPlus size={14} /> Opret konto
							</button>
						</div>
					) : (
						<ul className="flex flex-col gap-1.5">
							{filteredAccounts.map((account) => {
								const isSelected = selectedId === account.id && viewMode !== "CREATE";

								return (
									<li key={account.id}>
										<button
											type="button"
											onClick={() => handleSelectAccount(account)}
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
													{getTypeIcon(account.type)}
												</div>
												<div className="min-w-0">
													<div className="font-medium text-xs truncate">
														{account.username}
													</div>
													<div className="flex items-center gap-1.5 mt-0.5 text-[11px] opacity-60">
														<span>
															{account.type === "ORGANIZER"
																? "Arrangør"
																: account.type === "POST_GUARD"
																? "Postvagt"
																: "Holdkonto"}
														</span>
														{account.teamId !== undefined && (
															<span>· Hold #{account.teamId}</span>
														)}
														{account.stationId !== undefined && (
															<span>· Post #{account.stationId}</span>
														)}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
												<span
													role="button"
													title="Rediger"
													onClick={(e) => {
														e.stopPropagation();
														handleStartEdit(account);
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
														setAccountToDelete(account);
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
					/* Create Form */
					<div className="max-w-xl mx-auto">
						<div className={cn(card(), "p-6")}>
							<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
								<div>
									<h2 className="text-lg font-bold text-slate-900">Opret ny konto</h2>
									<p className="text-xs text-slate-500 mt-0.5">
										Opret en ny brugerkonto til arrangører, postvagter eller hold.
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
								{/* Type Selector */}
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
										Kontotype *
									</label>
									<div className="grid grid-cols-3 gap-2">
										<button
											type="button"
											onClick={() => setFormType("POST_GUARD")}
											className={cn(
												"p-3 rounded-lg border text-left transition-colors flex flex-col justify-between",
												formType === "POST_GUARD"
													? "bg-slate-900 text-white border-slate-900 font-semibold"
													: "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
											)}
										>
											<div className="flex items-center gap-1.5 text-xs font-bold">
												<IconFlag size={15} />
												<span>Postvagt</span>
											</div>
											<span className="text-[11px] opacity-75 mt-1 font-normal">
												Adgang til tidsregistrering
											</span>
										</button>

										<button
											type="button"
											onClick={() => setFormType("ORGANIZER")}
											className={cn(
												"p-3 rounded-lg border text-left transition-colors flex flex-col justify-between",
												formType === "ORGANIZER"
													? "bg-slate-900 text-white border-slate-900 font-semibold"
													: "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
											)}
										>
											<div className="flex items-center gap-1.5 text-xs font-bold">
												<IconShieldCheck size={15} />
												<span>Arrangør</span>
											</div>
											<span className="text-[11px] opacity-75 mt-1 font-normal">
												Fuld kontrolcenter-adgang
											</span>
										</button>

										<button
											type="button"
											onClick={() => setFormType("TEAM")}
											className={cn(
												"p-3 rounded-lg border text-left transition-colors flex flex-col justify-between",
												formType === "TEAM"
													? "bg-slate-900 text-white border-slate-900 font-semibold"
													: "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
											)}
										>
											<div className="flex items-center gap-1.5 text-xs font-bold">
												<IconUsers size={15} />
												<span>Hold</span>
											</div>
											<span className="text-[11px] opacity-75 mt-1 font-normal">
												Elevernes deltagerside
											</span>
										</button>
									</div>
								</div>

								{/* Username */}
								<div>
									<label
										htmlFor="new-username"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Brugernavn *
									</label>
									<input
										id="new-username"
										type="text"
										required
										className={cn(textField(), "w-full py-2 px-3 text-sm")}
										placeholder="f.eks. post_trae eller arrangor_hans"
										value={formUsername}
										onChange={(e) => setFormUsername(e.target.value)}
									/>
								</div>

								{/* Password */}
								<div>
									<label
										htmlFor="new-password"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Adgangskode *
									</label>
									<div className="relative">
										<input
											id="new-password"
											type={showPassword ? "text" : "password"}
											required
											className={cn(textField(), "w-full py-2 pl-3 pr-10 text-sm")}
											placeholder="Adgangskode til login..."
											value={formPassword}
											onChange={(e) => setFormPassword(e.target.value)}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
										>
											{showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
										</button>
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
										<span>Opret Konto</span>
									</button>
								</div>
							</form>
						</div>
					</div>
				) : viewMode === "EDIT" && selectedAccount ? (
					/* Edit Form */
					<div className="max-w-xl mx-auto">
						<div className={cn(card(), "p-6")}>
							<div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
								<div>
									<h2 className="text-lg font-bold text-slate-900">Rediger konto</h2>
									<p className="text-xs text-slate-500 mt-0.5">
										Opdater brugeroplysninger og adgangskode.
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
								{/* Type Selector */}
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
										Kontotype
									</label>
									<div className="grid grid-cols-3 gap-2">
										<button
											type="button"
											onClick={() => setFormType("POST_GUARD")}
											className={cn(
												"p-2.5 rounded-lg border text-center transition-colors text-xs font-semibold",
												formType === "POST_GUARD"
													? "bg-slate-900 text-white border-slate-900"
													: "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
											)}
										>
											Postvagt
										</button>
										<button
											type="button"
											onClick={() => setFormType("ORGANIZER")}
											className={cn(
												"p-2.5 rounded-lg border text-center transition-colors text-xs font-semibold",
												formType === "ORGANIZER"
													? "bg-slate-900 text-white border-slate-900"
													: "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
											)}
										>
											Arrangør
										</button>
										<button
											type="button"
											onClick={() => setFormType("TEAM")}
											className={cn(
												"p-2.5 rounded-lg border text-center transition-colors text-xs font-semibold",
												formType === "TEAM"
													? "bg-slate-900 text-white border-slate-900"
													: "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
											)}
										>
											Hold
										</button>
									</div>
								</div>

								{/* Username */}
								<div>
									<label
										htmlFor="edit-username"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Brugernavn *
									</label>
									<input
										id="edit-username"
										type="text"
										required
										className={cn(textField(), "w-full py-2 px-3 text-sm")}
										value={formUsername}
										onChange={(e) => setFormUsername(e.target.value)}
									/>
								</div>

								{/* Password */}
								<div>
									<label
										htmlFor="edit-password"
										className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
									>
										Adgangskode *
									</label>
									<div className="relative">
										<input
											id="edit-password"
											type={showPassword ? "text" : "password"}
											required
											className={cn(textField(), "w-full py-2 pl-3 pr-10 text-sm")}
											value={formPassword}
											onChange={(e) => setFormPassword(e.target.value)}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
										>
											{showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
										</button>
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
				) : selectedAccount ? (
					/* View Account Details */
					<div className="max-w-2xl mx-auto space-y-4">
						{/* Header Card */}
						<div className={cn(card(), "p-5")}>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3.5">
									<div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold">
										{getTypeIcon(selectedAccount.type)}
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h2 className="text-xl font-bold text-slate-900">
												{selectedAccount.username}
											</h2>
											{getTypeBadge(selectedAccount.type)}
										</div>
										<p className="text-xs text-slate-500 mt-0.5">
											{selectedAccount.type === "ORGANIZER"
												? "Arrangørkonto med fuld administrativ adgang"
												: selectedAccount.type === "POST_GUARD"
												? `Postvagt-konto ${
														selectedAccount.stationId !== undefined
															? `(Station #${selectedAccount.stationId})`
															: ""
												  }`
												: `Deltagerkonto ${
														selectedAccount.teamId !== undefined
															? `(Hold #${selectedAccount.teamId})`
															: ""
												  }`}
										</p>
									</div>
								</div>

								{/* Action buttons */}
								<div className="flex items-center gap-1.5">
									<button
										onClick={() => handleStartEdit(selectedAccount)}
										className={cn(
											button(),
											"px-3 py-1.5 text-xs font-medium flex items-center gap-1 hover:border-slate-800"
										)}
									>
										<IconEdit size={14} /> Rediger
									</button>
									<button
										onClick={() => setAccountToDelete(selectedAccount)}
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

						{/* Credentials Card */}
						<div className={cn(card(), "p-5 space-y-3")}>
							<h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
								Login Oplysninger
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{/* Username block */}
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
											onClick={() => handleCopy(selectedAccount.username, "username")}
											title="Kopier brugernavn"
											className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
										>
											{copiedField === "username" ? (
												<IconCheck size={14} className="text-emerald-600" />
											) : (
												<IconCopy size={14} />
											)}
										</button>
									</div>
								</div>

								{/* Password block */}
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
												onClick={() => handleCopy(selectedAccount.password, "password")}
												title="Kopier kode"
												className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
											>
												{copiedField === "password" ? (
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
					</div>
				) : (
					/* Empty state */
					<div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto text-center">
						<div className="w-14 h-14 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
							<IconKey size={26} />
						</div>
						<h3 className="text-base font-bold text-slate-800">Ingen konto valgt</h3>
						<p className="text-xs text-slate-500 mt-1 mb-4">
							Vælg en brugerkonto fra listen til venstre for at se og redigere detaljerne, eller opret en ny konto.
						</p>
						<button
							onClick={handleStartCreate}
							className={cn(
								button(),
								"bg-slate-900 text-white hover:bg-slate-800 border-transparent px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
							)}
						>
							<IconPlus size={16} /> Opret ny konto
						</button>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{accountToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 animate-in fade-in duration-100">
					<div className={cn(card(), "p-5 max-w-md w-full space-y-3.5")}>
						<div className="flex items-center gap-2.5 text-red-600">
							<div className="w-8 h-8 rounded-md bg-red-50 flex items-center justify-center shrink-0">
								<IconTrash size={18} />
							</div>
							<div>
								<h3 className="font-bold text-sm text-slate-900">Slet brugerkonto</h3>
								<p className="text-[11px] text-slate-500">Handlingen kan ikke fortrydes</p>
							</div>
						</div>

						<p className="text-xs text-slate-600">
							Er du sikker på, at du vil slette kontoen{" "}
							<span className="font-semibold text-slate-900">&quot;{accountToDelete.username}&quot;</span>?
						</p>

						{(accountToDelete.teamId !== undefined || accountToDelete.stationId !== undefined) && (
							<div className="p-2.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
								<IconAlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
								<span>
									<strong>Advarsel:</strong> Denne konto er tilknyttet et hold eller en station. Sletning af kontoen vil også slette det tilknyttede hold / station og alle registrerede tider!
								</span>
							</div>
						)}

						<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
							<button
								type="button"
								disabled={isDeleting}
								onClick={() => setAccountToDelete(null)}
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
								<span>Slet konto</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
