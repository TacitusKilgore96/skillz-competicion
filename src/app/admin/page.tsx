import {Icon} from "@/app/admin/AdminShell";
import Link from "next/link";

const stats = [["Active teams", "24", "Across 8 schools", "team"], ["Schools", "8", "2 new this season", "school"], ["Classes", "31", "Linked to schools", "class"], ["Upcoming events", "4", "Next: 18 Aug 2026", "calendar"]] as const;

export default function Page() {
	return (
		<>
			{/* Info */}
			<div className="mb-8">
				<p className="mb-2 text-xs font-bold uppercase tracking-widest text-hover">Dashboard</p>
				<h1 className="text-3xl font-bold tracking-tight text-slate-200">Good morning, admin</h1>
				<p className="mt-2 text-sm text-slate-400">Here’s what’s happening in your competition workspace.</p>
			</div>

			{/* Stats */}
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{
					stats.map(([label, value, note, icon]) => (
						<div key={label}
							 className="rounded-xl bg-white p-5 shadow-[0_2px_5px_rgba(25,32,44,.03)]">
							<div className="mb-5 flex items-center justify-between">
								<span className="text-xs font-semibold text-slate-500">{label}</span>
								<span className="rounded-lg bg-[#edf5e9] p-2 text-[#6c8a62]">
								<Icon name={icon}/>
							</span>
							</div>
							<p className="text-3xl font-bold text-[#202b3b]">{value}</p>
							<p className="mt-2 text-xs text-slate-400">{note}</p>
						</div>
					))
				}
			</div>
			<div className="mt-7 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
				<div className="rounded-xl border border-[#e6e9ed] bg-white p-6">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h2 className="font-bold text-[#263142]">Competition structure</h2>
							<p className="mt-1 text-xs text-slate-400">How your participants are organised</p>
						</div>
						<Link href="/admin/teams" className="text-xs font-bold text-[#6c8a62] hover:underline">
							View teams →
						</Link>
					</div>
					<div className="grid grid-cols-3 gap-3 text-center">
						<div className="rounded-lg bg-[#f7f8fa] p-5">
							<p className="text-2xl font-bold">8</p>
							<p className="mt-1 text-xs text-slate-500">Schools</p>
						</div>
						<div className="rounded-lg bg-[#f7f8fa] p-5">
							<p className="text-2xl font-bold">31</p>
							<p className="mt-1 text-xs text-slate-500">Classes</p>
						</div>
						<div className="rounded-lg bg-[#f7f8fa] p-5">
							<p className="text-2xl font-bold">24</p>
							<p className="mt-1 text-xs text-slate-500">Teams</p>
						</div>
					</div>
				</div>
				<div className="rounded-xl border border-[#e6e9ed] bg-white p-6">
					<h2 className="font-bold text-[#263142]">Next event</h2>
					<div className="mt-5 flex gap-4">
						<div className="rounded-lg bg-[#f2e7d7] px-3 py-2 text-center">
							<p className="text-[10px] font-bold uppercase text-[#9c7042]">Aug</p>
							<p className="text-xl font-bold text-[#80582c]">18</p>
						</div>
						<div>
							<p className="font-semibold">Opening ceremony</p>
							<p className="mt-1 text-xs text-slate-400">Tuesday · 09:00 – 10:00</p>
							<p className="mt-1 text-xs text-slate-500">Main hall</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
