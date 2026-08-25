import type { Metadata } from "next";
import {AdminShell, Icon} from "@/app/admin/AdminShell";
import Link from "next/link";
import {cn} from "tailwind-variants";

export const metadata: Metadata = {
	title: "Admin · Skills Competition",
	description: "Manage schools, classes, teams and events.",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
	return (
		<div className="min-h-screen text-slate-600">
			<div className="flex min-h-screen">
				{/* Sidebar */}
				<aside className="hidden w-61.5 shrink-0 flex-col bg-background-secondary text-slate-300 md:flex">
					{/* Sidebar header */}
					<div className="flex h-20.5 items-center gap-3 border-b border-white/10 px-7">
						{/* Site Logo */}
						<div
							className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d7eacb] text-sm font-black text-[#263a2d]">
							SC
						</div>

						{/* Site Name */}
						<div>
							<p className="text-[13px] font-bold tracking-wide text-white">SKILLS COMPETITION</p>
							<p className="mt-0.5 text-[10px] uppercase tracking-[.18em] text-slate-400">Control centre</p>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-3 py-7">
						<p className="px-3 pb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Manage</p>
						{
							nav.map(([label, href, icon]) => {
								const active = pathname == null ? false :
									(href === "/admin" ? pathname === href : pathname.startsWith(href));
								return (
									<Link key={href} href={href}
										  className={cn(
											  "mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition",
											  active ? "bg-hover font-semibold" : "hover:bg-white/5 hover:text-white"
										  )}
									>
										<Icon name={icon}/>
										{label}
									</Link>
								);
							})
						}
					</nav>

					{/* Profile */}
					<div className="border-t border-white/10 p-5">
						<div className="flex items-center gap-3">
							<div
								className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0c98e] text-xs font-bold text-[#6f4b1b]">
								OL
							</div>
							<div>
								<p className="text-xs font-semibold text-white">Competition admin</p>
								<p className="text-[11px] text-slate-400">Administrator</p>
							</div>
						</div>
					</div>
				</aside>

				<main className="min-w-0 flex-1">
					{/* Header */}
					<header className="flex h-20.5 items-center justify-between bg-box-background px-6 md:px-10">
						<div className={"mx-auto text-center"}>
							<p className="text-xs font-medium text-slate-200">Tuesday, 11 August 2026</p>
							<p className="mt-1 text-sm font-semibold text-slate-400">Competition workspace</p>
						</div>
					</header>

					{/* Content */}
					<div className="mx-auto max-w-330 p-6 md:p-10">{children}</div>
				</main>
			</div>
		</div>
	);
}
