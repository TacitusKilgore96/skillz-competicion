"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {FormEvent, ReactNode, useState} from "react";
import {cn} from "tailwind-variants";

type IconName = "grid" | "school" | "class" | "team" | "calendar" | "settings";

export function Icon({name}: { name: IconName }) {
	const paths: Record<IconName, string> = {
		grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
		school: "M3 20h18M5 20V9l7-4 7 4v11M9 20v-5h6v5M8 10h.01M12 10h.01M16 10h.01",
		class: "M4 5h16v14H4zM8 9h8M8 13h5M8 17h8",
		team: "M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 20v-2a4 4 0 0 0-3-3.87M16 2.13a4 4 0 0 1 0 7.75",
		calendar: "M5 4h14v17H5zM8 2v4M16 2v4M5 9h14M9 13h2M13 13h2M9 17h2",
		settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 12a7 7 0 0 0-.1-1.1l2-1.55-2-3.46-2.35.95A7 7 0 0 0 14.9 6L14.6 3h-4l-.3 3a7 7 0 0 0-1.65.84L6.3 5.9l-2 3.46 2 1.55A7 7 0 0 0 4 12l2.3 1.1-2 1.55 2 3.46 2.35-.95A7 7 0 0 0 10.3 18l.3 3h4l.3-3a7 7 0 0 0 1.65-.84l2.35.95 2-3.46-2-1.55c.06-.36.1-.73.1-1.1Z",
	};
	return (
		<svg aria-hidden="true" className="size-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
			 strokeWidth="1.8">
			<path d={paths[name]} strokeLinecap="round" strokeLinejoin="round"/>
		</svg>
	);
}

const nav = [
	["Overview", "/admin", "grid"], ["Teams", "/admin/teams", "team"],
	["Schools", "/admin/schools", "school"], ["Classes", "/admin/classes", "class"],
	["Events", "/admin/events", "calendar"],
] as const;

export function AdminShell({children}: { children: ReactNode }) {
	const pathname = usePathname();
	return (
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
	);
}

type Resource = "teams" | "schools" | "classes" | "events";
type Row = {
	id: number;
	name: string;
	school?: string;
	className?: string;
	teams?: number;
	date?: string;
	location?: string;
	status?: string
};
const data: Record<Resource, Row[]> = {
	teams: [{id: 1, name: "Team Orbit", school: "Nordby School", className: "8A", status: "Ready"}, {
		id: 2,
		name: "Team Sparks",
		school: "Westfield College",
		className: "9B",
		status: "Ready"
	}, {id: 3, name: "The Challengers", school: "Eastbridge School", className: "8C", status: "Needs review"}, {
		id: 4,
		name: "Team Momentum",
		school: "Nordby School",
		className: "9A",
		status: "Ready"
	}],
	schools: [{id: 1, name: "Nordby School", teams: 4}, {id: 2, name: "Westfield College", teams: 3}, {
		id: 3,
		name: "Eastbridge School",
		teams: 5
	}, {id: 4, name: "Riverside Academy", teams: 2}],
	classes: [{id: 1, name: "8A", school: "Nordby School", teams: 2}, {
		id: 2,
		name: "9B",
		school: "Westfield College",
		teams: 1
	}, {id: 3, name: "8C", school: "Eastbridge School", teams: 3}, {
		id: 4,
		name: "9A",
		school: "Nordby School",
		teams: 2
	}],
	events: [{id: 1, name: "Opening ceremony", date: "18 Aug 2026", location: "Main hall", status: "Scheduled"}, {
		id: 2,
		name: "Competition day 1",
		date: "19 Aug 2026",
		location: "All posts",
		status: "Scheduled"
	}, {id: 3, name: "Finals & awards", date: "21 Aug 2026", location: "Sports centre", status: "Draft"}],
};

const config = {
	teams: {
		singular: "team",
		title: "Teams",
		description: "Organise contestants into teams and connect them to a class.",
		columns: ["Team name", "School", "Class", "Status"]
	},
	schools: {
		singular: "school",
		title: "Schools",
		description: "Manage the schools taking part in this competition.",
		columns: ["School name", "Teams", ""]
	},
	classes: {
		singular: "class",
		title: "Classes",
		description: "Classes belong to a school and can have multiple teams.",
		columns: ["Class name", "School", "Teams"]
	},
	events: {
		singular: "event",
		title: "Events",
		description: "Schedule competition events and important moments.",
		columns: ["Event", "Date", "Location", "Status"]
	}
} as const;

export function ResourcePage({kind}: { kind: Resource }) {
	const c = config[kind];
	const [rows, setRows] = useState(data[kind]);
	const [search, setSearch] = useState("");
	const [editing, setEditing] = useState<Row | null>(null);
	const [adding, setAdding] = useState(false);
	const filtered = rows.filter((r) => Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase()));
	const save = (row: Row) => {
		setRows((current) => editing ? current.map((item) => item.id === row.id ? row : item) : [...current, {
			...row,
			id: Date.now()
		}]);
		setEditing(null);
		setAdding(false);
	};
	return <>
		<div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
			<div>
				<p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#6c8a62]">Manage</p>
				<h1

					className="text-3xl font-bold tracking-tight text-[#202b3b]">{c.title}</h1>
				<p className="mt-2 text-sm text-slate-500">{c.description}</p>
			</div>
			<button onClick={() => setAdding(true)}
					className="rounded-lg bg-[#5d8254] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#4c7045]">
				+ Add {c.singular}
			</button>
		</div>
		<div
			className="overflow-hidden rounded-xl border border-[#e6e9ed] bg-white shadow-[0_2px_5px_rgba(25,32,44,.03)]">
			<div
				className="flex flex-col gap-3 border-b border-[#edf0f2] p-4 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-xs font-semibold text-slate-500">{rows.length} {c.title.toLowerCase()}</p>
				<input value={search} onChange={(e) => setSearch(e.target.value)}
					   placeholder={`Search ${c.title.toLowerCase()}...`}
					   className="w-full rounded-lg border border-[#dfe4e9] px-3 py-2 text-sm outline-none sm:w-64"/>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full min-w-155 text-left text-sm">
					<thead className="bg-[#fafbfc] text-[11px] font-bold uppercase tracking-wider text-slate-400">
					<tr>
						{
							c.columns.map((col) => (
								<th key={col} className="px-5 py-3">{col}</th>
							))
						}
						<th className="px-5 py-3 text-right">Actions</th>
					</tr>
					</thead>
					<tbody className="divide-y divide-[#edf0f2]">
					{
						filtered.map((row) => (
							<tr key={row.id} className="hover:bg-[#fcfdfc]">
								<td className="px-5 py-4 font-semibold text-[#293546]">{row.name}</td>
								{
									kind === "teams" && (
										<>
											<td className="px-5 py-4 text-slate-500">{row.school}</td>
											<td className="px-5 py-4 text-slate-500">{row.className}</td>
											<td className="px-5 py-4"><Badge text={row.status!}/></td>
										</>
									)
								}
								{
									kind === "schools" && (
										<>
											<td className="px-5 py-4 text-slate-500">{row.teams} teams</td>
											<td/>
										</>
									)
								}
								{
									kind === "classes" && (
										<>
											<td className="px-5 py-4 text-slate-500">{row.school}</td>
											<td className="px-5 py-4 text-slate-500">{row.teams} teams</td>
										</>
									)
								}
								{
									kind === "events" && (
										<>
											<td className="px-5 py-4 text-slate-500">{row.date}</td>
											<td className="px-5 py-4 text-slate-500">{row.location}</td>
											<td className="px-5 py-4"><Badge text={row.status!}/></td>
										</>
									)
								}
								<td className="px-5 py-4 text-right">
									<button onClick={() => setEditing(row)}
											className="mr-3 text-xs font-bold text-[#5d8254] hover:underline">
										Edit
									</button>
									<button onClick={() => setRows(rows.filter((item) => item.id !== row.id))}
											className="text-xs font-bold text-[#bd6868] hover:underline">
										Remove
									</button>
								</td>
							</tr>
						))
					}
					</tbody>
				</table>
			</div>
			{
				filtered.length === 0 && (
					<p className="p-10 text-center text-sm text-slate-400">No {c.title.toLowerCase()} found.</p>
				)
			}
		</div>
		{
			(adding || editing) && (
				<EditModal kind={kind} row={editing} onClose={() => {
					setAdding(false);
					setEditing(null);
				}} onSave={save}/>
			)
		}
	</>;
}

function Badge({text}: { text: string }) {
	return <span
		className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${text === "Ready" || text === "Scheduled" ? "bg-[#edf5e9] text-[#5d8254]" : "bg-[#f5eee3] text-[#a5753e]"}`}>
		{text}
	</span>;
}

function EditModal({kind, row, onClose, onSave}: {
	kind: Resource;
	row: Row | null;
	onClose: () => void;
	onSave: (row: Row) => void
}) {
	const [name, setName] = useState(row?.name ?? "");
	const [school, setSchool] = useState(row?.school ?? "Nordby School");
	const [className, setClassName] = useState(row?.className ?? "8A");
	const [date, setDate] = useState(row?.date ?? "");
	const [location, setLocation] = useState(row?.location ?? "");
	const submit = (e: FormEvent) => {
		e.preventDefault();
		onSave({
			id: row?.id ?? 0,
			name,
			school: kind === "schools" ? undefined : school,
			className: kind === "teams" ? className : undefined,
			date: kind === "events" ? date : undefined,
			location: kind === "events" ? location : undefined,
			teams: 0,
			status: kind === "events" ? "Draft" : kind === "teams" ? "Ready" : undefined
		});
	};
	const input = (label: string, value: string, set: (value: string) => void, placeholder: string) => (
		<label className="block text-sm font-semibold text-slate-600">
			{label}
			<input required value={value}
				   onChange={(e) => set(e.target.value)}
				   placeholder={placeholder}
				   className="mt-2 w-full rounded-lg border border-[#dfe4e9] px-3 py-2.5 font-normal outline-none focus:border-[#6c8a62]"/>
		</label>
	)

	return (
		<div className="fixed inset-0 z-10 flex items-center justify-center bg-[#182231]/40 p-4">
			<form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
				<div className="mb-6 flex items-start justify-between">
					<div>
						<h2 className="text-xl font-bold">
							{row ? "Edit" : "Add"} {config[kind].singular}
						</h2>
						<p className="mt-1 text-xs text-slate-400">
							Fill in the details below.
						</p>
					</div>
					<button type="button" onClick={onClose} className="text-xl text-slate-400">×</button>
				</div>
				<div
					className="space-y-4">{input(kind === "events" ? "Event name" : `${config[kind].singular[0].toUpperCase()}${config[kind].singular.slice(1)} name`, name, setName, `Enter ${config[kind].singular} name`)}{kind === "teams" && <>{input("School", school, setSchool, "School name")}{input("Class", className, setClassName, "Class name")}</>}{kind === "classes" && input("School", school, setSchool, "School name")}{kind === "events" && <>{input("Date", date, setDate, "e.g. 18 Aug 2026")}{input("Location", location, setLocation, "Where is it happening?")}</>}</div>
				<div className="mt-7 flex justify-end gap-3">
					<button type="button" onClick={onClose}
							className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">
						Cancel
					</button>
					<button
						className="rounded-lg bg-[#5d8254] px-4 py-2 text-sm font-bold text-white hover:bg-[#4c7045]">
						Save {config[kind].singular}
					</button>
				</div>
			</form>
		</div>
	);
}
