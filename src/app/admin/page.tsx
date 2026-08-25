import { AdminIcon } from "@/app/admin/AdminSidebar";
import Link from "next/link";

const stats = [
	{ label: "Active teams", value: "24", note: "Across 8 schools", icon: "team" as const },
	{ label: "Schools", value: "8", note: "Participating institutions", icon: "school" as const },
	{ label: "Classes", value: "31", note: "Linked to schools", icon: "class" as const },
	{ label: "Upcoming events", value: "3", note: "Next: 18 Aug 2026", icon: "calendar" as const },
];

export default function OverviewPage() {
	return (
		<>
			{/* Info Header */}
			<div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
				<div>
					<p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#63b84f]">Dashboard</p>
					<h1 className="text-3xl font-bold tracking-tight text-white">Good morning, admin</h1>
					<p className="mt-1 text-sm text-slate-400">Here’s what’s happening in your competition workspace.</p>
				</div>
				<div className="flex gap-3">
					<Link
						href="/admin/teams"
						className="inline-flex items-center gap-2 rounded-lg bg-hover px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#325d23] transition-colors"
					>
						<AdminIcon name="team" className="size-4" />
						Manage Teams
					</Link>
					<Link
						href="/admin/events"
						className="inline-flex items-center gap-2 rounded-lg bg-box-background border border-border px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5 transition-colors"
					>
						<AdminIcon name="calendar" className="size-4" />
						View Events
					</Link>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{stats.map(({ label, value, note, icon }) => (
					<div
						key={label}
						className="rounded-xl border border-border/60 bg-box-background p-5 shadow-[0_2px_10px_rgba(0,0,0,.2)]"
					>
						<div className="mb-4 flex items-center justify-between">
							<span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
							<span className="rounded-lg bg-white/5 p-2 text-[#63b84f] border border-white/5">
								<AdminIcon name={icon} className="size-5" />
							</span>
						</div>
						<p className="text-3xl font-bold text-white tracking-tight">{value}</p>
						<p className="mt-2 text-xs text-slate-400">{note}</p>
					</div>
				))}
			</div>

			<div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
				{/* Competition Structure */}
				<div className="rounded-xl border border-border/60 bg-box-background p-6 shadow-sm">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h2 className="text-base font-bold text-white">Competition structure</h2>
							<p className="mt-1 text-xs text-slate-400">How your participants are organized under events</p>
						</div>
						<Link href="/admin/teams" className="text-xs font-bold text-[#63b84f] hover:underline inline-flex items-center gap-1">
							Manage teams tree →
						</Link>
					</div>
					<div className="grid grid-cols-3 gap-3 text-center">
						<div className="rounded-xl bg-background/50 border border-border/40 p-4">
							<p className="text-2xl font-extrabold text-white">8</p>
							<p className="mt-1 text-xs font-medium text-slate-400">Schools</p>
						</div>
						<div className="rounded-xl bg-background/50 border border-border/40 p-4">
							<p className="text-2xl font-extrabold text-white">31</p>
							<p className="mt-1 text-xs font-medium text-slate-400">Classes</p>
						</div>
						<div className="rounded-xl bg-background/50 border border-border/40 p-4">
							<p className="text-2xl font-extrabold text-[#63b84f]">24</p>
							<p className="mt-1 text-xs font-medium text-slate-400">Teams</p>
						</div>
					</div>
					<div className="mt-5 rounded-lg border border-border/30 bg-background/30 p-3.5 flex items-center justify-between text-xs">
						<span className="text-slate-300">Hierarchy: <span className="text-white font-medium">Events → Schools → Classes → Teams</span></span>
						<Link href="/admin/teams" className="font-semibold text-slate-300 hover:text-white">
							Open threaded view
						</Link>
					</div>
				</div>

				{/* Next Event */}
				<div className="rounded-xl border border-border/60 bg-box-background p-6 shadow-sm flex flex-col justify-between">
					<div>
						<div className="flex items-center justify-between">
							<h2 className="text-base font-bold text-white">Next upcoming event</h2>
							<span className="inline-flex items-center rounded-full bg-[#19351a] px-2.5 py-0.5 text-[11px] font-semibold text-[#63b84f] border border-[#63b84f]/20">
								Scheduled
							</span>
						</div>
						<div className="mt-5 flex gap-4">
							<div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 text-center shrink-0">
								<p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Aug</p>
								<p className="text-2xl font-black text-amber-300">18</p>
							</div>
							<div className="min-w-0">
								<p className="font-bold text-white text-base truncate">Opening ceremony</p>
								<p className="mt-1 text-xs text-slate-400">Tuesday · 09:00 – 10:00</p>
								<p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
									<span className="size-1.5 rounded-full bg-slate-500" />
									Main hall · 8 schools participating
								</p>
							</div>
						</div>
					</div>
					<div className="mt-6 border-t border-border/40 pt-4 flex items-center justify-between">
						<Link href="/admin/events" className="text-xs font-semibold text-[#63b84f] hover:underline">
							View all 3 events →
						</Link>
						<Link href="/admin/teams" className="text-xs font-semibold text-slate-400 hover:text-white">
							View event teams →
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}
