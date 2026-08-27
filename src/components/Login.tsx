"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	IconLock,
	IconUser,
	IconEye,
	IconEyeOff,
	IconLoader2,
	IconAlertTriangle,
	IconArrowRight,
	IconShieldCheck,
	IconFlag,
	IconUsers,
} from "@tabler/icons-react";
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
		<div className="w-full max-w-lg mx-auto">
			<div className="rounded-2xl border border-border bg-box-background p-7 sm:p-9 space-y-6 text-primary shadow-xl">
				<div className="space-y-1.5">
					<p className="text-xs uppercase tracking-[0.35em] text-secondary font-bold">
						login
					</p>
					<h1 className="text-2xl font-black text-primary">Log ind på Skills</h1>
					<p className="text-xs text-secondary">
						{redirectUrl
							? "Log ind for at fortsætte til den valgte side"
							: "Indtast brugernavn og adgangskode for at fortsætte"}
					</p>
				</div>

				{error && (
					<div className="p-3.5 rounded-xl bg-danger-background border border-danger/40 text-danger text-xs flex items-center gap-2.5">
						<IconAlertTriangle size={17} className="shrink-0 text-danger" />
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label
							htmlFor="login-username"
							className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2"
						>
							Brugernavn
						</label>
						<div className="relative">
							<IconUser
								size={17}
								className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary"
							/>
							<input
								id="login-username"
								type="text"
								required
								autoFocus
								autoComplete="username"
								placeholder="Indtast dit brugernavn..."
								className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-primary placeholder:text-secondary/50 outline-none focus:border-green transition"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="login-password"
							className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2"
						>
							Adgangskode
						</label>
						<div className="relative">
							<IconLock
								size={17}
								className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary"
							/>
							<input
								id="login-password"
								type={showPassword ? "text" : "password"}
								required
								autoComplete="current-password"
								placeholder="••••••••"
								className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm font-mono text-primary placeholder:text-secondary/50 outline-none focus:border-green transition"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition"
								tabIndex={-1}
							>
								{showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
							</button>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 px-4 rounded-xl bg-accent-blue-background hover:opacity-90 font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
					>
						{loading ? (
							<>
								<IconLoader2 size={16} className="animate-spin" />
								<span>Logger ind...</span>
							</>
						) : (
							<>
								<span>Log ind</span>
								<IconArrowRight size={16} />
							</>
						)}
					</button>
				</form>

				<div className="pt-5 border-t border-border space-y-2.5">
					<p className="text-[11px] font-semibold uppercase tracking-wider text-secondary text-center">
						Hurtig login (genvej)
					</p>
					<div className="grid grid-cols-3 gap-2">
						<button
							type="button"
							onClick={() => handleQuickFill("organizer", "password123")}
							className="p-2.5 rounded-xl border border-border bg-background hover:bg-box-background text-primary text-center text-xs transition"
						>
							<div className="flex items-center justify-center gap-1 font-bold text-[11px]">
								<IconShieldCheck size={14} className="text-warning" />
								<span>Arrangør</span>
							</div>
							<span className="text-[10px] text-secondary block mt-0.5 font-mono">
								organizer
							</span>
						</button>

						<button
							type="button"
							onClick={() => handleQuickFill("post_guard", "password123")}
							className="p-2.5 rounded-xl border border-border bg-background hover:bg-box-background text-primary text-center text-xs transition"
						>
							<div className="flex items-center justify-center gap-1 font-bold text-[11px]">
								<IconFlag size={14} className="text-success" />
								<span>Postvagt</span>
							</div>
							<span className="text-[10px] text-secondary block mt-0.5 font-mono">
								post_guard
							</span>
						</button>

						<button
							type="button"
							onClick={() => handleQuickFill("8a_hold1", "password123")}
							className="p-2.5 rounded-xl border border-border bg-background hover:bg-box-background text-primary text-center text-xs transition"
						>
							<div className="flex items-center justify-center gap-1 font-bold text-[11px]">
								<IconUsers size={14} className="text-id-nr" />
								<span>Hold 1</span>
							</div>
							<span className="text-[10px] text-secondary block mt-0.5 font-mono">
								8a_hold1
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
