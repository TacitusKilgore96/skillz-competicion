"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "tailwind-variants";
import { useParams, usePathname } from "next/navigation";
import EventSelector from "@/components/admin/EventSelector";
import {
	IconLayoutDashboard,
	IconSchool,
	IconUsers,
	IconFlag,
	IconKey,
	IconChevronLeft,
	IconClock,
	IconTrophy,
} from "@tabler/icons-react";

interface ShellProps {
	pageTitle: string;
	children: React.ReactNode;
}

export function EventShell({ pageTitle, children }: ShellProps) {
	const [now, setNow] = useState<Date>(() => new Date());

	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 30000);
		return () => clearInterval(timer);
	}, []);

	const dateStr = now.toLocaleDateString("da-DK", {
		weekday: "short",
		day: "numeric",
		month: "short",
	});

	const timeStr = now.toLocaleTimeString("da-DK", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
			{/* Sidebar */}
			<aside className="w-56 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
				<div>
					{/* App Branding */}
					<div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between">
						<Link
							href="/admin"
							className="flex items-center gap-2 text-white font-bold text-base hover:opacity-90 transition-opacity"
						>
							<div className="w-7 h-7 rounded bg-white text-slate-900 flex items-center justify-center font-black text-xs">
								<IconTrophy size={16} />
							</div>
							<span>Skills</span>
						</Link>
						<span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
							Admin
						</span>
					</div>

					{/* Navigation Links */}
					<nav className="p-3 space-y-1">
						<PathLink
							label="Oversigt"
							href=""
							pathRegex={/^$/}
							icon={<IconLayoutDashboard size={17} />}
						/>
						<PathLink
							label="Klasser"
							href="classes"
							pathRegex={/^classes/}
							icon={<IconSchool size={17} />}
						/>
						<PathLink
							label="Hold"
							href="teams"
							pathRegex={/^teams/}
							icon={<IconUsers size={17} />}
						/>
						<PathLink
							label="Stationer"
							href="stations"
							pathRegex={/^stations/}
							icon={<IconFlag size={17} />}
						/>
						<PathLink
							label="Kontoer"
							href="accounts"
							pathRegex={/^accounts/}
							icon={<IconKey size={17} />}
						/>
					</nav>
				</div>

				{/* Bottom Sidebar: Return to all events */}
				<div className="p-3 border-t border-slate-800">
					<Link
						href="/admin"
						className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
					>
						<IconChevronLeft size={15} />
						<span>Alle begivenheder</span>
					</Link>
				</div>
			</aside>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-w-0 h-full">
				{/* Top Bar Header */}
				<header className="h-14 px-6 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between z-10">
					{/* Left: Page Title */}
					<div className="flex items-center gap-2 min-w-0">
						<h1 className="font-bold text-base text-slate-900 truncate">
							{pageTitle}
						</h1>
					</div>

					{/* Right: Date / Time + Event Selector */}
					<div className="flex items-center gap-3">
						<div
							className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80"
							suppressHydrationWarning
						>
							<IconClock size={14} className="text-slate-400 shrink-0" />
							<span className="capitalize">{dateStr}</span>
							<span className="text-slate-300">·</span>
							<span className="font-mono font-semibold text-slate-700">
								{timeStr}
							</span>
						</div>

						<div className="w-56 shrink-0">
							<EventSelector />
						</div>
					</div>
				</header>

				{/* Main Body */}
				<main className="flex-1 overflow-y-auto bg-slate-50 relative">
					{children}
				</main>
			</div>
		</div>
	);
}

interface PathLinkProps {
	label: string;
	href: string;
	pathRegex: RegExp;
	icon: React.ReactNode;
}

function PathLink({ label, href, pathRegex, icon }: PathLinkProps) {
	const pathname = usePathname();
	const { eventId } = useParams();

	const trimmedPath = pathname.replace(/^\/admin\/[0-9]+(\/)?/, "");
	const isActive = pathRegex.test(trimmedPath);

	return (
		<Link
			href={`/admin/${eventId}${href ? `/${href}` : ""}`}
			className={cn(
				"flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors",
				isActive
					? "bg-slate-800 text-white font-semibold"
					: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium"
			)}
		>
			<span className={cn(isActive ? "text-white" : "text-slate-400")}>
				{icon}
			</span>
			<span>{label}</span>
		</Link>
	);
}
