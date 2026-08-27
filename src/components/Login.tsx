"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "tailwind-variants";
import {
	IconLock,
	IconUser,
	IconEye,
	IconEyeOff,
	IconLoader2,
	IconAlertTriangle,
	IconCheck,
	IconTrophy,
	IconArrowRight,
	IconShieldCheck,
	IconFlag,
	IconUsers,
} from "@tabler/icons-react";
import { button } from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import card from "@/components/admin/Card";
import { loginUser } from "@/libs/auth";

export default function Login() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get("redirect");

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleQuickFill = (u: string, p: string) => {
		setUsername(u);
		setPassword(p);
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const trimmedUser = username.trim();
		if (!trimmedUser || !password) {
			setError("Indtast venligst både brugernavn og adgangskode.");
			return;
		}

		setLoading(true);
		try {
			const user = await loginUser(trimmedUser, password);

			// Redirect logic:
			// If a valid redirect target is given, use that.
			// Otherwise redirect according to role.
			if (redirectUrl && redirectUrl.startsWith("/")) {
				window.location.href = redirectUrl;
			} else {
				if (user.type === "ORGANIZER") {
					window.location.href = "/admin";
				} else if (user.type === "POST_GUARD") {
					window.location.href = "/station";
				} else if (user.type === "TEAM") {
					window.location.href = "/team";
				} else {
					window.location.href = "/";
				}
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Ugyldigt brugernavn eller adgangskode";
			setError(msg);
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md mx-auto">
			{/* Login Card */}
			<div className={cn(card(), "p-6 sm:p-8 space-y-6")}>
				{/* Header Branding */}
				<div className="text-center space-y-1.5">
					<div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 text-white font-bold mb-1">
						<IconTrophy size={20} />
					</div>
					<h1 className="text-xl font-bold text-slate-900">Log ind på Skills</h1>
					<p className="text-xs text-slate-500 max-w-xs mx-auto">
						{redirectUrl
							? "Log venligst ind for at fortsætte til den ønskede side"
							: "Indtast dine loginoplysninger for at få adgang til din konto"}
					</p>
				</div>

				{/* Error Notice */}
				{error && (
					<div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
						<IconAlertTriangle size={16} className="shrink-0 text-red-600" />
						<span>{error}</span>
					</div>
				)}

				{/* Login Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Username */}
					<div>
						<label
							htmlFor="login-username"
							className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
						>
							Brugernavn
						</label>
						<div className="relative">
							<IconUser
								size={16}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							/>
							<input
								id="login-username"
								type="text"
								required
								autoFocus
								autoComplete="username"
								placeholder="Indtast dit brugernavn..."
								className={cn(textField(), "w-full pl-9 pr-3 py-2 text-sm")}
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>
					</div>

					{/* Password */}
					<div>
						<label
							htmlFor="login-password"
							className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
						>
							Adgangskode
						</label>
						<div className="relative">
							<IconLock
								size={16}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							/>
							<input
								id="login-password"
								type={showPassword ? "text" : "password"}
								required
								autoComplete="current-password"
								placeholder="••••••••"
								className={cn(textField(), "w-full pl-9 pr-10 py-2 text-sm font-mono")}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
								tabIndex={-1}
							>
								{showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
							</button>
						</div>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={loading}
						className={cn(
							button(),
							"w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border-transparent flex items-center justify-center gap-2 mt-2"
						)}
					>
						{loading ? (
							<>
								<IconLoader2 size={16} className="animate-spin" />
								<span>Logger ind...</span>
							</>
						) : (
							<>
								<span>Log ind</span>
								<IconArrowRight size={15} />
							</>
						)}
					</button>
				</form>

				{/* Quick Test Accounts Pill Selection */}
				<div className="pt-4 border-t border-slate-100 space-y-2">
					<p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
						Hurtig test login (udvikling)
					</p>
					<div className="grid grid-cols-3 gap-1.5">
						<button
							type="button"
							onClick={() => handleQuickFill("organizer", "password123")}
							className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-center text-xs transition-colors"
						>
							<div className="flex items-center justify-center gap-1 font-semibold text-[11px]">
								<IconShieldCheck size={13} className="text-slate-700" />
								<span>Arrangør</span>
							</div>
							<span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
								organizer
							</span>
						</button>

						<button
							type="button"
							onClick={() => handleQuickFill("post_guard", "password123")}
							className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-center text-xs transition-colors"
						>
							<div className="flex items-center justify-center gap-1 font-semibold text-[11px]">
								<IconFlag size={13} className="text-slate-700" />
								<span>Postvagt</span>
							</div>
							<span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
								post_guard
							</span>
						</button>

						<button
							type="button"
							onClick={() => handleQuickFill("8a_hold1", "password123")}
							className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-center text-xs transition-colors"
						>
							<div className="flex items-center justify-center gap-1 font-semibold text-[11px]">
								<IconUsers size={13} className="text-slate-700" />
								<span>Hold 1</span>
							</div>
							<span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
								8a_hold1
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
