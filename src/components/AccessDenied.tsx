"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "tailwind-variants";
import {
	IconShieldLock,
	IconLogout,
	IconArrowLeft,
	IconUser,
	IconAlertCircle,
	IconLoader2,
} from "@tabler/icons-react";
import card from "@/components/admin/Card";
import { button } from "@/components/admin/Button";
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
			<div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
				<IconLoader2 size={24} className="animate-spin text-slate-600" />
				<span className="text-xs">Tjekker tilladelser...</span>
			</div>
		);
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<div className={cn(card(), "p-6 sm:p-8 space-y-6 text-center")}>
				{/* Icon */}
				<div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
					<IconShieldLock size={26} />
				</div>

				{/* Title & Description */}
				<div className="space-y-1.5">
					<h1 className="text-xl font-bold text-slate-900">Adgang ikke tilladt</h1>
					<p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
						Du har ikke de nødvendige rettigheder til at få adgang til denne side med din nuværende brugerkonto.
					</p>
				</div>

				{/* Current User Pill */}
				{user && (
					<div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between text-left">
						<div className="flex items-center gap-2.5 min-w-0">
							<div className="w-7 h-7 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
								<IconUser size={14} />
							</div>
							<div className="min-w-0">
								<div className="font-semibold text-slate-900 truncate">
									{user.username}
								</div>
								<div className="text-[11px] text-slate-500">
									Rolle: <span className="font-medium text-slate-700">{formatRole(user.type)}</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Relogin Instruction Message */}
				<div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2 text-left">
					<IconAlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
					<span>
						For at få adgang skal du <strong>logge ud</strong> og <strong>logge ind igen</strong> med en konto, der har adgang.
					</span>
				</div>

				{/* Actions */}
				<div className="space-y-2 pt-2">
					<button
						type="button"
						disabled={isLoggingOut}
						onClick={handleLogoutAndRelogin}
						className={cn(
							button(),
							"w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border-transparent flex items-center justify-center gap-2"
						)}
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
						className={cn(
							button(),
							"w-full py-2 px-4 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border-slate-200 flex items-center justify-center gap-1.5"
						)}
					>
						<IconArrowLeft size={15} />
						<span>Gå til din forside</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
