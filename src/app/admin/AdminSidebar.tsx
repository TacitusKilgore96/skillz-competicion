"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "tailwind-variants";

export type IconName = "grid" | "team" | "calendar" | "school" | "class" | "settings" | "chevron" | "plus" | "search" | "check" | "trash" | "edit" | "refresh" | "save" | "user" | "sparkles";

export function AdminIcon({ name, className = "size-4.5" }: { name: IconName; className?: string }) {
	const paths: Record<IconName, string> = {
		grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
		team: "M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 20v-2a4 4 0 0 0-3-3.87M16 2.13a4 4 0 0 1 0 7.75",
		calendar: "M5 4h14v17H5zM8 2v4M16 2v4M5 9h14M9 13h2M13 13h2M9 17h2",
		school: "M3 20h18M5 20V9l7-4 7 4v11M9 20v-5h6v5M8 10h.01M12 10h.01M16 10h.01",
		class: "M4 5h16v14H4zM8 9h8M8 13h5M8 17h8",
		settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 12a7 7 0 0 0-.1-1.1l2-1.55-2-3.46-2.35.95A7 7 0 0 0 14.9 6L14.6 3h-4l-.3 3a7 7 0 0 0-1.65.84L6.3 5.9l-2 3.46 2 1.55A7 7 0 0 0 4 12l2.3 1.1-2 1.55 2 3.46 2.35-.95A7 7 0 0 0 10.3 18l.3 3h4l.3-3a7 7 0 0 0 1.65-.84l2.35.95 2-3.46-2-1.55c.06-.36.1-.73.1-1.1Z",
		chevron: "m9 18 6-6-6-6",
		plus: "M12 5v14M5 12h14",
		search: "m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z",
		check: "M20 6 9 17l-5-5",
		trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6",
		edit: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
		refresh: "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8m0 0V3m0 5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16m0 0v5m0-5h-5",
		save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
		user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
		sparkles: "m12 3 1.912 5.885L19.797 10.8 13.912 12.715 12 18.6 10.088 12.715 4.203 10.8l5.885-1.915L12 3z",
	};

	return (
		<svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
			<path d={paths[name] || paths.grid} strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

const navItems = [
	{ label: "Overview", href: "/admin", icon: "grid" as const },
	{ label: "Teams", href: "/admin/teams", icon: "team" as const },
	{ label: "Events", href: "/admin/events", icon: "calendar" as const },
];

export function AdminSidebar() {
	const pathname = usePathname();

	return (
		<aside className="flex w-64 shrink-0 flex-col bg-background-secondary text-slate-300 border-r border-border/40">
			{/* Sidebar header */}
			<div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
				{/* Site Logo */}
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d7eacb] to-[#a8d394] text-sm font-black text-[#263a2d] shadow-sm">
					SC
				</div>

				{/* Site Name */}
				<div>
					<p className="text-[13px] font-bold tracking-wide text-white">SKILLS COMPETITION</p>
					<p className="mt-0.5 text-[10px] uppercase tracking-[.18em] text-slate-400">Control centre</p>
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-3 py-6">
				<p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Manage</p>
				<div className="space-y-1">
					{navItems.map(({ label, href, icon }) => {
						const active = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
						return (
							<Link
								key={href}
								href={href}
								className={cn(
									"flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium transition-colors",
									active
										? "bg-hover text-white font-semibold shadow-sm"
										: "text-slate-300 hover:bg-white/5 hover:text-white"
								)}
							>
								<AdminIcon name={icon} className={cn("size-5", active ? "text-white" : "text-slate-400")} />
								<span>{label}</span>
							</Link>
						);
					})}
				</div>
			</nav>

			{/* Profile */}
			<div className="border-t border-white/10 p-5 bg-black/10">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0c98e] text-xs font-bold text-[#6f4b1b] ring-2 ring-[#f0c98e]/20">
						OL
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-xs font-semibold text-white truncate">Competition admin</p>
						<p className="text-[11px] text-slate-400 truncate">Administrator</p>
					</div>
				</div>
			</div>
		</aside>
	);
}
