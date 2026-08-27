"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
	IconShieldLock,
	IconLogout,
	IconArrowLeft,
	IconUser,
	IconAlertCircle,
	IconLoader2,
} from "@tabler/icons-react";
import { getCurrentUser, logoutUser, AuthUser } from "@/libs/auth";

export default function AccessDenied() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const targetPath = searchParams.get("target") || searchParams.get("redirect") || "/";

	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	useEffect(() => {
		getCurrentUser().then((u) => {
			setUser(u);
			setLoading(false);
		});
	}, []);

	const handleLogoutAndRelogin = async () => {
		setIsLoggingOut(true);
		try {
			await logoutUser();
			const loginUrl = targetPath && targetPath !== "/"
				? `/login?redirect=${encodeURIComponent(targetPath)}`
				: "/login";
			window.location.href = loginUrl;
		} catch {
			window.location.href = "/login";
		}
	};

	const getUserHomePath = () => {
		if (!user) return "/login";
		if (user.type === "ORGANIZER") return "/admin";
		if (user.type === "POST_GUARD") return "/station";
		if (user.type === "TEAM") return "/team";
		return "/";
	};

	const formatRole = (type?: string) => {
		if (type === "ORGANIZER") return "Arrangør";
		if (type === "POST_GUARD") return "Postvagt";
		if (type === "TEAM") return "Hold";
		return "Bruger";
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-secondary gap-2">
				<IconLoader2 size={24} className="animate-spin text-primary" />
				<span className="text-xs">Tjekker tilladelser...</span>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="rounded-2xl border border-border bg-box-background p-7 sm:p-9 space-y-6 text-center text-primary shadow-xl">
				{/* Icon */}
				<div className="w-14 h-14 rounded-2xl bg-danger-background border border-danger/30 text-danger flex items-center justify-center mx-auto text-2xl">
					<IconShieldLock size={28} />
				</div>

				{/* Title & Description */}
				<div className="space-y-2">
					<h1 className="text-2xl font-black text-primary">Adgang ikke tilladt</h1>
					<p className="text-xs text-secondary max-w-xs mx-auto leading-relaxed">
						Du har ikke rettigheder til at få adgang til denne side med din nuværende konto.
					</p>
				</div>

				{/* Current User Pill */}
				{user && (
					<div className="p-3.5 rounded-xl bg-background border border-border text-xs text-primary flex items-center justify-between text-left">
						<div className="flex items-center gap-3 min-w-0">
							<div className="w-8 h-8 rounded-lg bg-box-background border border-border text-secondary flex items-center justify-center font-bold text-xs shrink-0">
								<IconUser size={15} />
							</div>
							<div className="min-w-0">
								<div className="font-bold text-primary truncate">
									{user.username}
								</div>
								<div className="text-[11px] text-secondary">
									Rolle: <span className="font-semibold text-primary">{formatRole(user.type)}</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Relogin Instruction Message */}
				<div className="p-3.5 rounded-xl bg-warning-background border border-warning/30 text-warning text-xs flex items-start gap-2.5 text-left">
					<IconAlertCircle size={17} className="text-warning shrink-0 mt-0.5" />
					<span>
						For at få adgang skal du <strong>logge ud</strong> og <strong>logge ind igen</strong> med en konto, der har de rette rettigheder.
					</span>
				</div>

				{/* Actions */}
				<div className="space-y-2.5 pt-2">
					<button
						type="button"
						disabled={isLoggingOut}
						onClick={handleLogoutAndRelogin}
						className="w-full py-3 px-4 rounded-xl bg-accent-blue-background hover:opacity-90 font-bold text-xs text-white flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
					>
						{isLoggingOut ? (
							<>
								<IconLoader2 size={16} className="animate-spin" />
								<span>Logger ud...</span>
							</>
						) : (
							<>
								<IconLogout size={16} />
								<span>Log ud og log ind med anden konto</span>
							</>
						)}
					</button>

					<Link
						href={getUserHomePath()}
						className="w-full py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-box-background font-semibold text-xs text-secondary hover:text-primary flex items-center justify-center gap-1.5 transition"
					>
						<IconArrowLeft size={15} />
						<span>Gå til din forside</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
