import type { Metadata } from "next";
import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

export const metadata: Metadata = {
	title: "Admin · Skills Competition",
	description: "Manage teams, schools, classes and events.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-[#0d122b] text-slate-200">
			<div className="flex min-h-screen">
				{/* Sidebar Shell */}
				<AdminSidebar />

				{/* Main Content Area */}
				<main className="min-w-0 flex-1 flex flex-col bg-[#0b1028]">
					{/* Header */}
					<header className="flex h-20 items-center justify-between border-b border-border/40 bg-box-background px-6 md:px-10">
						<div>
							<span className="inline-flex items-center gap-2 rounded-full bg-[#19351a] px-3 py-1 text-xs font-semibold text-[#63b84f] border border-[#63b84f]/20">
								<span className="size-1.5 rounded-full bg-[#63b84f] animate-pulse" />
								Live System
							</span>
						</div>
						<div className="text-center">
							<p className="text-xs font-medium text-slate-300">Tuesday, 11 August 2026</p>
							<p className="mt-0.5 text-xs font-semibold text-slate-400">Competition Workspace</p>
						</div>
					</header>

					{/* Content */}
					<div className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">{children}</div>
				</main>
			</div>
		</div>
	);
}
