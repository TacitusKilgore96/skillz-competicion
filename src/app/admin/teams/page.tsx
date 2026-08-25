"use client";

import React, { useState, useMemo, useId, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminIcon } from "@/app/admin/AdminSidebar";
import { initialEvents, EventItem } from "@/app/admin/events/page";

export interface TeamMember {
	id: string;
	name: string;
	role?: string;
}

export interface Team {
	id: number;
	name: string;
	schoolId: number;
	classId: number;
	image: string;
	status: "Ready" | "Needs review" | "In progress" | "Checked in";
	station: string;
	members: TeamMember[];
	notes: string;
	coachName?: string;
	coachEmail?: string;
}

export interface ClassItem {
	id: number;
	name: string;
	schoolId: number;
	grade?: string;
}

export interface School {
	id: number;
	name: string;
	city: string;
	eventIds: number[];
}

// Initial rich mock datasets
const initialSchools: School[] = [
	{ id: 1, name: "Nordby School", city: "Aarhus", eventIds: [1, 2, 3] },
	{ id: 2, name: "Westfield College", city: "Odense", eventIds: [1, 2, 3] },
	{ id: 3, name: "Eastbridge School", city: "Copenhagen", eventIds: [1, 2] },
	{ id: 4, name: "Riverside Academy", city: "Aalborg", eventIds: [1, 2] },
];

const initialClasses: ClassItem[] = [
	{ id: 101, name: "Class 8A", schoolId: 1, grade: "8th Grade" },
	{ id: 102, name: "Class 9A", schoolId: 1, grade: "9th Grade" },
	{ id: 103, name: "Class 9B", schoolId: 2, grade: "9th Grade" },
	{ id: 104, name: "Class 10A", schoolId: 2, grade: "10th Grade" },
	{ id: 105, name: "Class 8C", schoolId: 3, grade: "8th Grade" },
	{ id: 106, name: "Class 9C", schoolId: 3, grade: "9th Grade" },
	{ id: 107, name: "Class 8B", schoolId: 4, grade: "8th Grade" },
];

const initialTeams: Team[] = [
	{
		id: 1,
		name: "Team Orbit",
		schoolId: 1,
		classId: 101,
		image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80",
		status: "Ready",
		station: "Station 01",
		members: [
			{ id: "m-1", name: "Alex Jensen", role: "Captain / Builder" },
			{ id: "m-2", name: "Emma Nielsen", role: "Programmer" },
			{ id: "m-3", name: "Lucas Friis", role: "Electronics" },
		],
		notes: "Focusing on rapid assembly and ultrasonic sensor calibration.",
		coachName: "Martin Vester",
		coachEmail: "m.vester@nordbyschool.dk",
	},
	{
		id: 2,
		name: "Team Momentum",
		schoolId: 1,
		classId: 101,
		image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
		status: "Ready",
		station: "Station 02",
		members: [
			{ id: "m-4", name: "Sofia Berg", role: "Captain" },
			{ id: "m-5", name: "Oliver Holm", role: "Circuit Designer" },
		],
		notes: "Specialized in micro-controller logic and motor drivers.",
		coachName: "Martin Vester",
		coachEmail: "m.vester@nordbyschool.dk",
	},
	{
		id: 3,
		name: "Team Apex",
		schoolId: 1,
		classId: 102,
		image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&auto=format&fit=crop&q=80",
		status: "Ready",
		station: "Station 05",
		members: [
			{ id: "m-6", name: "Liam Moller", role: "Lead Engineer" },
			{ id: "m-7", name: "Ida Lind", role: "Telemetry" },
			{ id: "m-8", name: "Noah Poulsen", role: "Driver" },
		],
		notes: "Previous regional semi-finalists. High precision robotic arm.",
		coachName: "Helle Svendsen",
		coachEmail: "h.svendsen@nordbyschool.dk",
	},
	{
		id: 4,
		name: "Team Sparks",
		schoolId: 2,
		classId: 103,
		image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80",
		status: "Ready",
		station: "Station 03",
		members: [
			{ id: "m-9", name: "Marcus Dahl", role: "Systems Architect" },
			{ id: "m-10", name: "Freja Krogh", role: "Programmer" },
			{ id: "m-11", name: "Victor Rasmussen", role: "Hardware" },
		],
		notes: "Autonomous navigation algorithm with LiDAR scanning.",
		coachName: "Thomas Birch",
		coachEmail: "t.birch@westfield.dk",
	},
	{
		id: 5,
		name: "Team Quantum",
		schoolId: 2,
		classId: 104,
		image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80",
		status: "Needs review",
		station: "Station 06",
		members: [
			{ id: "m-12", name: "Clara Vester", role: "Captain" },
			{ id: "m-13", name: "Emil Simonsen", role: "Programmer" },
		],
		notes: "Pending health consent form for driver Emil.",
		coachName: "Thomas Birch",
		coachEmail: "t.birch@westfield.dk",
	},
	{
		id: 6,
		name: "The Challengers",
		schoolId: 3,
		classId: 105,
		image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80",
		status: "Needs review",
		station: "Station 04",
		members: [
			{ id: "m-14", name: "Hannah Bak", role: "Lead" },
			{ id: "m-15", name: "Mathias Lund", role: "Mechanics" },
			{ id: "m-16", name: "Alma Noer", role: "Coding" },
			{ id: "m-17", name: "Elias Thomsen", role: "Design" },
		],
		notes: "Requires safety visor check before entering competition zone.",
		coachName: "Kasper Moeller",
		coachEmail: "k.moeller@eastbridge.dk",
	},
	{
		id: 7,
		name: "Team Cyber",
		schoolId: 3,
		classId: 106,
		image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80",
		status: "Ready",
		station: "Station 07",
		members: [
			{ id: "m-18", name: "Oscar Dam", role: "Lead" },
			{ id: "m-19", name: "Sara Kjaer", role: "Embedded C++" },
		],
		notes: "High speed wireless data logging setup tested and approved.",
		coachName: "Kasper Moeller",
		coachEmail: "k.moeller@eastbridge.dk",
	},
	{
		id: 8,
		name: "Team Velocity",
		schoolId: 4,
		classId: 107,
		image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80",
		status: "Ready",
		station: "Station 08",
		members: [
			{ id: "m-20", name: "Karla Frost", role: "Captain" },
			{ id: "m-21", name: "William Bach", role: "Mechatronics" },
		],
		notes: "Compact chassis design with dual high-torque stepper motors.",
		coachName: "Susanne Ravn",
		coachEmail: "s.ravn@riverside.dk",
	},
];

const presetAvatars = [
	"https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&auto=format&fit=crop&q=80",
	"https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80",
];

function TeamsPageContent() {
	const searchParams = useSearchParams();
	const eventParam = searchParams.get("event");

	const [events] = useState<EventItem[]>(initialEvents);
	const [overrideEventId, setOverrideEventId] = useState<number | null>(null);

	const selectedEventId = useMemo(() => {
		if (overrideEventId !== null) return overrideEventId;
		if (eventParam) {
			const parsed = Number(eventParam);
			if (events.some((e) => e.id === parsed)) {
				return parsed;
			}
		}
		return 1;
	}, [overrideEventId, eventParam, events]);

	const setSelectedEventId = (id: number) => {
		setOverrideEventId(id);
	};

	const [schools, setSchools] = useState<School[]>(initialSchools);
	const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
	const [teams, setTeams] = useState<Team[]>(initialTeams);

	// Draft state storing uncommitted team edits keyed by team ID
	const [drafts, setDrafts] = useState<Record<number, Team>>({});

	// Active selected team ID
	const [selectedTeamId, setSelectedTeamId] = useState<number>(1);

	// Tree expand/collapse states
	const [expandedSchools, setExpandedSchools] = useState<Record<number, boolean>>({
		1: true,
		2: true,
		3: true,
		4: true,
	});
	const [expandedClasses, setExpandedClasses] = useState<Record<number, boolean>>({
		101: true,
		102: true,
		103: true,
		104: true,
		105: true,
		106: true,
		107: true,
	});

	// Tree search query
	const [searchQuery, setSearchQuery] = useState("");

	// Notification toast
	const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

	const memberInputId = useId();
	const roleInputId = useId();

	// Modal states for adding new School, Class, or Team
	const [addModal, setAddModal] = useState<
		| { type: "school" }
		| { type: "class"; schoolId: number; schoolName: string }
		| { type: "team"; schoolId: number; classId: number; className: string }
		| null
	>(null);
	const [modalName, setModalName] = useState("");

	const showToast = (message: string, type: "success" | "info" = "success") => {
		setToast({ message, type });
		setTimeout(() => {
			setToast(null);
		}, 3500);
	};

	// Selected event object
	const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

	// Filter schools participating in the selected event
	const connectedSchools = useMemo(() => {
		if (!selectedEvent) return schools;
		return schools.filter((s) => s.eventIds.includes(selectedEvent.id));
	}, [schools, selectedEvent]);

	// Filter classes for connected schools
	const connectedSchoolIds = useMemo(() => connectedSchools.map((s) => s.id), [connectedSchools]);

	const connectedClasses = useMemo(() => {
		return classes.filter((c) => connectedSchoolIds.includes(c.schoolId));
	}, [classes, connectedSchoolIds]);

	// Helper to get active team data (either draft or saved)
	const getEffectiveTeam = useCallback(
		(teamId: number): Team | undefined => {
			if (drafts[teamId]) {
				return drafts[teamId];
			}
			return teams.find((t) => t.id === teamId);
		},
		[drafts, teams]
	);

	// Current active team being edited
	const activeTeam = getEffectiveTeam(selectedTeamId) || teams[0];
	const originalSavedTeam = teams.find((t) => t.id === selectedTeamId);

	// Check if active team has dirty/unsaved draft changes
	const isTeamDirty = useMemo(() => {
		if (!originalSavedTeam || !drafts[selectedTeamId]) return false;
		return JSON.stringify(drafts[selectedTeamId]) !== JSON.stringify(originalSavedTeam);
	}, [drafts, originalSavedTeam, selectedTeamId]);

	// Count total teams with unsaved drafts
	const dirtyTeamIds = useMemo(() => {
		return Object.keys(drafts)
			.map(Number)
			.filter((id) => {
				const orig = teams.find((t) => t.id === id);
				return orig && JSON.stringify(drafts[id]) !== JSON.stringify(orig);
			});
	}, [drafts, teams]);

	// Total counts for the current event
	const eventMetrics = useMemo(() => {
		const connectedClassIds = connectedClasses.map((c) => c.id);
		const connectedTeamsList = teams.filter((t) => connectedClassIds.includes(t.classId));
		const totalMembersCount = connectedTeamsList.reduce((sum, t) => sum + (t.members?.length || 0), 0);

		return {
			schoolsCount: connectedSchools.length,
			classesCount: connectedClasses.length,
			teamsCount: connectedTeamsList.length,
			membersCount: totalMembersCount,
		};
	}, [connectedSchools, connectedClasses, teams]);

	// Filter tree based on search query
	const filteredTree = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) {
			return {
				schools: connectedSchools,
				classes: connectedClasses,
				teams: teams,
			};
		}

		const matchingTeams = teams.filter((t) => {
			const effective = getEffectiveTeam(t.id) || t;
			return (
				effective.name.toLowerCase().includes(q) ||
				effective.station.toLowerCase().includes(q) ||
				effective.members.some((m) => m.name.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q))
			);
		});

		const matchingClassIds = new Set<number>();
		matchingTeams.forEach((t) => matchingClassIds.add(t.classId));
		connectedClasses.forEach((c) => {
			if (c.name.toLowerCase().includes(q)) matchingClassIds.add(c.id);
		});

		const matchingSchoolIds = new Set<number>();
		matchingTeams.forEach((t) => matchingSchoolIds.add(t.schoolId));
		connectedClasses.forEach((c) => {
			if (matchingClassIds.has(c.id)) matchingSchoolIds.add(c.schoolId);
		});
		connectedSchools.forEach((s) => {
			if (s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)) {
				matchingSchoolIds.add(s.id);
			}
		});

		return {
			schools: connectedSchools.filter((s) => matchingSchoolIds.has(s.id)),
			classes: connectedClasses.filter((c) => matchingClassIds.has(c.id)),
			teams: teams.filter((t) => matchingTeams.some((mt) => mt.id === t.id)),
		};
	}, [searchQuery, connectedSchools, connectedClasses, teams, getEffectiveTeam]);

	// Toggle school expansion
	const toggleSchool = (schoolId: number) => {
		setExpandedSchools((prev) => ({ ...prev, [schoolId]: !prev[schoolId] }));
	};

	// Toggle class expansion
	const toggleClass = (classId: number) => {
		setExpandedClasses((prev) => ({ ...prev, [classId]: !prev[classId] }));
	};

	// Expand / Collapse all
	const handleExpandAll = () => {
		const allSchools: Record<number, boolean> = {};
		connectedSchools.forEach((s) => (allSchools[s.id] = true));
		setExpandedSchools(allSchools);

		const allClasses: Record<number, boolean> = {};
		connectedClasses.forEach((c) => (allClasses[c.id] = true));
		setExpandedClasses(allClasses);
	};

	const handleCollapseAll = () => {
		setExpandedSchools({});
		setExpandedClasses({});
	};

	// Update field in active draft
	const updateActiveTeamField = <K extends keyof Team>(field: K, value: Team[K]) => {
		if (!activeTeam) return;
		const updatedTeam: Team = {
			...activeTeam,
			[field]: value,
		};
		setDrafts((prev) => ({
			...prev,
			[activeTeam.id]: updatedTeam,
		}));
	};

	// Add new member to team
	const [newMemberName, setNewMemberName] = useState("");
	const [newMemberRole, setNewMemberRole] = useState("");

	const handleAddMember = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMemberName.trim() || !activeTeam) return;

		const newMember: TeamMember = {
			id: `m-${Date.now()}`,
			name: newMemberName.trim(),
			role: newMemberRole.trim() || "Team Member",
		};

		const updatedMembers = [...(activeTeam.members || []), newMember];
		updateActiveTeamField("members", updatedMembers);
		setNewMemberName("");
		setNewMemberRole("");
	};

	const handleRemoveMember = (memberId: string) => {
		if (!activeTeam) return;
		const updatedMembers = (activeTeam.members || []).filter((m) => m.id !== memberId);
		updateActiveTeamField("members", updatedMembers);
	};

	// Save active team draft
	const handleSaveTeam = () => {
		if (!activeTeam) return;
		setTeams((prev) => prev.map((t) => (t.id === activeTeam.id ? activeTeam : t)));
		setDrafts((prev) => {
			const next = { ...prev };
			delete next[activeTeam.id];
			return next;
		});
		showToast(`Changes saved for "${activeTeam.name}" (Draft committed).`, "success");
	};

	// Cancel active team draft
	const handleCancelDraft = () => {
		if (!activeTeam) return;
		setDrafts((prev) => {
			const next = { ...prev };
			delete next[activeTeam.id];
			return next;
		});
		showToast(`Draft changes discarded for "${originalSavedTeam?.name || "team"}".`, "info");
	};

	// Save all drafts
	const handleSaveAllDrafts = () => {
		setTeams((prev) =>
			prev.map((t) => {
				if (drafts[t.id]) {
					return drafts[t.id];
				}
				return t;
			})
		);
		setDrafts({});
		showToast(`All draft changes saved across ${dirtyTeamIds.length} teams.`, "success");
	};

	// Discard all drafts
	const handleDiscardAllDrafts = () => {
		setDrafts({});
		showToast("All pending draft changes were discarded.", "info");
	};

	// Handle Modal Submissions for Add School, Class, Team
	const handleModalSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!modalName.trim() || !addModal) return;

		if (addModal.type === "school") {
			const newSchool: School = {
				id: Date.now(),
				name: modalName.trim(),
				city: "Copenhagen",
				eventIds: [selectedEventId],
			};
			setSchools((prev) => [...prev, newSchool]);
			setExpandedSchools((prev) => ({ ...prev, [newSchool.id]: true }));
			showToast(`Added school "${newSchool.name}" to this event.`, "success");
		} else if (addModal.type === "class") {
			const newClass: ClassItem = {
				id: Date.now(),
				name: modalName.trim(),
				schoolId: addModal.schoolId,
				grade: "Standard",
			};
			setClasses((prev) => [...prev, newClass]);
			setExpandedClasses((prev) => ({ ...prev, [newClass.id]: true }));
			showToast(`Added class "${newClass.name}" to ${addModal.schoolName}.`, "success");
		} else if (addModal.type === "team") {
			const newTeam: Team = {
				id: Date.now(),
				name: modalName.trim(),
				schoolId: addModal.schoolId,
				classId: addModal.classId,
				image: presetAvatars[Math.floor(Math.random() * presetAvatars.length)],
				status: "Ready",
				station: `Station ${String(teams.length + 1).padStart(2, "0")}`,
				members: [],
				notes: "Newly created competition team.",
				coachName: "Admin",
			};
			setTeams((prev) => [...prev, newTeam]);
			setSelectedTeamId(newTeam.id);
			showToast(`Created team "${newTeam.name}" in ${addModal.className}.`, "success");
		}

		setAddModal(null);
		setModalName("");
	};

	// Active team's assigned school & class
	const activeSchool = schools.find((s) => s.id === activeTeam?.schoolId);
	const activeClass = classes.find((c) => c.id === activeTeam?.classId);

	return (
		<div className="space-y-6">
			{/* Toast Notification */}
			{toast && (
				<div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-border bg-box-background px-5 py-3.5 shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-5">
					<span
						className={`size-2.5 rounded-full ${
							toast.type === "success" ? "bg-[#63b84f]" : "bg-amber-400"
						}`}
					/>
					<span className="text-white">{toast.message}</span>
				</div>
			)}

			{/* ======================================================== */}
			{/* TOP SECTION: EVENT SELECTOR & CONNECTED EVENT STATS      */}
			{/* ======================================================== */}
			<div className="rounded-2xl border border-border/70 bg-box-background p-6 shadow-xl relative overflow-hidden">
				<div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#63b84f]/5 blur-3xl pointer-events-none" />

				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					{/* Left: Event Picker & Title */}
					<div className="space-y-3">
						<div className="flex flex-wrap items-center gap-3">
							<span className="text-[11px] font-bold uppercase tracking-widest text-[#63b84f]">
								Selected Event
							</span>
							{/* Event Quick Switcher Pills */}
							<div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 p-1">
								{events.map((ev) => (
									<button
										key={ev.id}
										onClick={() => setSelectedEventId(ev.id)}
										className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
											selectedEventId === ev.id
												? "bg-hover text-white shadow-sm"
												: "text-slate-400 hover:text-slate-200"
										}`}
									>
										{ev.name}
									</button>
								))}
							</div>
						</div>

						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
									{selectedEvent?.name || "Competition Event"}
								</h1>
								<span
									className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
										selectedEvent?.status === "Scheduled"
											? "bg-[#19351a] text-[#63b84f] border-[#63b84f]/20"
											: "bg-amber-500/10 text-amber-300 border-amber-500/20"
									}`}
								>
									{selectedEvent?.status}
								</span>
							</div>
							<p className="mt-1 text-xs sm:text-sm text-slate-400">
								{selectedEvent?.description} · <span className="text-slate-300 font-medium">{selectedEvent?.date}</span> at{" "}
								<span className="text-slate-300 font-medium">{selectedEvent?.location}</span>
							</p>
						</div>

						{/* Connected Schools Tags */}
						<div className="flex flex-wrap items-center gap-2 pt-1">
							<span className="text-xs text-slate-400 font-medium">Connected Schools:</span>
							{connectedSchools.map((school) => (
								<span
									key={school.id}
									className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-background/40 px-2.5 py-1 text-xs font-medium text-slate-200"
								>
									<AdminIcon name="school" className="size-3.5 text-[#63b84f]" />
									{school.name}
								</span>
							))}
							<button
								onClick={() => setAddModal({ type: "school" })}
								className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:border-white/40 transition-colors"
							>
								<AdminIcon name="plus" className="size-3" />
								Add School
							</button>
						</div>
					</div>

					{/* Right: Event Summary Metrics */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 lg:max-w-md w-full">
						<div className="rounded-xl border border-border/50 bg-background/40 p-3.5 text-center">
							<p className="text-2xl font-black text-white">{eventMetrics.schoolsCount}</p>
							<p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
								Schools
							</p>
						</div>
						<div className="rounded-xl border border-border/50 bg-background/40 p-3.5 text-center">
							<p className="text-2xl font-black text-white">{eventMetrics.classesCount}</p>
							<p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
								Classes
							</p>
						</div>
						<div className="rounded-xl border border-border/50 bg-background/40 p-3.5 text-center">
							<p className="text-2xl font-black text-[#63b84f]">{eventMetrics.teamsCount}</p>
							<p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
								Teams
							</p>
						</div>
						<div className="rounded-xl border border-border/50 bg-background/40 p-3.5 text-center">
							<p className="text-2xl font-black text-white">{eventMetrics.membersCount}</p>
							<p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
								Contestants
							</p>
						</div>
					</div>
				</div>

				{/* Unsaved Drafts Global Bar */}
				{dirtyTeamIds.length > 0 && (
					<div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
						<div className="flex items-center gap-2">
							<span className="size-2 rounded-full bg-amber-400 animate-ping" />
							<span>
								<strong className="font-bold text-white">{dirtyTeamIds.length}</strong> team
								{dirtyTeamIds.length > 1 ? "s have" : " has"} uncommitted draft changes in memory:{" "}
								<span className="font-mono text-amber-300">
									{dirtyTeamIds
										.map((id) => getEffectiveTeam(id)?.name || `Team #${id}`)
										.join(", ")}
								</span>
							</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={handleDiscardAllDrafts}
								className="rounded-lg border border-amber-500/40 bg-box-background px-3 py-1.5 font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
							>
								Discard All
							</button>
							<button
								onClick={handleSaveAllDrafts}
								className="rounded-lg bg-amber-500 px-3 py-1.5 font-bold text-black hover:bg-amber-400 transition-colors shadow-sm"
							>
								Save All Drafts
							</button>
						</div>
					</div>
				)}
			</div>

			{/* ======================================================== */}
			{/* MAIN 2-COLUMN VIEW: TREE (LEFT) + TEAM EDITOR (RIGHT)    */}
			{/* ======================================================== */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
				{/* ---------------------------------------------------- */}
				{/* LEFT COLUMN (lg:col-span-5): THREADED TREE LIST      */}
				{/* ---------------------------------------------------- */}
				<div className="lg:col-span-5 rounded-2xl border border-border/70 bg-box-background shadow-xl overflow-hidden flex flex-col min-h-[640px]">
					{/* Tree Header / Controls */}
					<div className="p-4 border-b border-border/50 bg-background/20 space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<AdminIcon name="team" className="size-4 text-[#63b84f]" />
								<h2 className="text-sm font-bold text-white tracking-wide uppercase">
									Structure & Hierarchy
								</h2>
							</div>
							<div className="flex items-center gap-1.5 text-xs text-slate-400">
								<button
									onClick={handleExpandAll}
									className="px-2 py-1 rounded hover:bg-white/5 hover:text-white transition-colors"
									title="Expand all nodes"
								>
									Expand
								</button>
								<span>·</span>
								<button
									onClick={handleCollapseAll}
									className="px-2 py-1 rounded hover:bg-white/5 hover:text-white transition-colors"
									title="Collapse all nodes"
								>
									Collapse
								</button>
							</div>
						</div>

						{/* Search Box */}
						<div className="relative">
							<AdminIcon
								name="search"
								className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400"
							/>
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Filter schools, classes, teams, members..."
								className="w-full rounded-lg border border-border/60 bg-background/50 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
							/>
						</div>
					</div>

					{/* Tree Content */}
					<div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[700px]">
						{filteredTree.schools.length === 0 ? (
							<div className="p-8 text-center text-slate-500">
								<AdminIcon name="school" className="mx-auto size-8 mb-2 opacity-40" />
								<p className="text-xs font-semibold text-slate-400">No schools or teams matched</p>
								<p className="text-[11px] text-slate-500 mt-0.5">Try clearing the search filter.</p>
							</div>
						) : (
							filteredTree.schools.map((school) => {
								const isSchoolOpen = expandedSchools[school.id] ?? true;
								const schoolClasses = filteredTree.classes.filter((c) => c.schoolId === school.id);
								const schoolClassIds = schoolClasses.map((c) => c.id);
								const schoolTeams = filteredTree.teams.filter((t) =>
									schoolClassIds.includes(t.classId)
								);

								return (
									<div
										key={school.id}
										className="rounded-xl border border-border/40 bg-background/20 overflow-hidden transition-all"
									>
										{/* School Level Header */}
										<div className="flex items-center justify-between px-3 py-2.5 bg-background/40 hover:bg-white/[0.03] transition-colors group">
											<button
												onClick={() => toggleSchool(school.id)}
												className="flex items-center gap-2.5 flex-1 text-left min-w-0"
											>
												<span
													className={`text-slate-400 transition-transform duration-150 ${
														isSchoolOpen ? "rotate-90" : ""
													}`}
												>
													<AdminIcon name="chevron" className="size-3.5" />
												</span>
												<AdminIcon name="school" className="size-4 text-[#63b84f] shrink-0" />
												<span className="text-sm font-bold text-white truncate">
													{school.name}
												</span>
												<span className="rounded-full bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 shrink-0">
													{schoolClasses.length} class{schoolClasses.length !== 1 ? "es" : ""} ·{" "}
													{schoolTeams.length} team{schoolTeams.length !== 1 ? "s" : ""}
												</span>
											</button>

											<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={() =>
														setAddModal({
															type: "class",
															schoolId: school.id,
															schoolName: school.name,
														})
													}
													className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1"
													title="Add Class to this School"
												>
													<AdminIcon name="plus" className="size-3" />
													Class
												</button>
											</div>
										</div>

										{/* Classes under School */}
										{isSchoolOpen && (
											<div className="p-2 space-y-2 border-t border-border/30 pl-4">
												{schoolClasses.length === 0 ? (
													<div className="py-2 pl-4 text-xs text-slate-500 italic">
														No classes in this school.
													</div>
												) : (
													schoolClasses.map((cls) => {
														const isClassOpen = expandedClasses[cls.id] ?? true;
														const classTeams = filteredTree.teams.filter(
															(t) => t.classId === cls.id
														);

														return (
															<div
																key={cls.id}
																className="rounded-lg border border-border/30 bg-box-background/50 overflow-hidden"
															>
																{/* Class Level Header */}
																<div className="flex items-center justify-between px-2.5 py-2 hover:bg-white/[0.02] transition-colors group">
																	<button
																		onClick={() => toggleClass(cls.id)}
																		className="flex items-center gap-2 flex-1 text-left min-w-0"
																	>
																		<span
																			className={`text-slate-400 transition-transform duration-150 ${
																				isClassOpen ? "rotate-90" : ""
																			}`}
																		>
																			<AdminIcon name="chevron" className="size-3" />
																		</span>
																		<AdminIcon
																			name="class"
																			className="size-3.5 text-blue-400 shrink-0"
																		/>
																		<span className="text-xs font-semibold text-slate-200 truncate">
																			{cls.name}
																		</span>
																		<span className="text-[10px] text-slate-500 font-normal">
																			({classTeams.length} team
																			{classTeams.length !== 1 ? "s" : ""})
																		</span>
																	</button>

																	<button
																		onClick={() =>
																			setAddModal({
																				type: "team",
																				schoolId: school.id,
																				classId: cls.id,
																				className: cls.name,
																			})
																		}
																		className="opacity-0 group-hover:opacity-100 rounded px-1.5 py-0.5 text-slate-400 hover:text-white hover:bg-white/10 text-[11px] font-medium flex items-center gap-1 transition-opacity"
																		title="Add Team to this Class"
																	>
																		<AdminIcon name="plus" className="size-2.5" />
																		Team
																	</button>
																</div>

																{/* Teams under Class (Threaded / Tree Nodes) */}
																{isClassOpen && (
																	<div className="p-1 space-y-1 border-t border-border/20 pl-3">
																		{classTeams.length === 0 ? (
																			<div className="py-2 pl-3 text-[11px] text-slate-500 italic">
																				No teams in this class.
																			</div>
																		) : (
																			classTeams.map((team) => {
																				const isSelected =
																					selectedTeamId === team.id;
																				const effective =
																					getEffectiveTeam(team.id) || team;
																				const hasDraft =
																					drafts[team.id] !== undefined &&
																					JSON.stringify(drafts[team.id]) !==
																						JSON.stringify(team);

																				return (
																					<button
																						key={team.id}
																						onClick={() =>
																							setSelectedTeamId(team.id)
																						}
																						className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all ${
																							isSelected
																								? "bg-hover text-white shadow-md font-semibold ring-1 ring-white/20"
																								: "hover:bg-white/5 text-slate-300"
																						}`}
																					>
																						<div className="flex items-center gap-2.5 min-w-0">
																							{/* Team avatar / image thumbnail */}
																							<div className="size-6 rounded-md overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
																								{effective.image ? (
																									// eslint-disable-next-line @next/next/no-img-element
																									<img
																										src={effective.image}
																										alt={effective.name}
																										className="size-full object-cover"
																									/>
																								) : (
																									<AdminIcon
																										name="team"
																										className="size-3 text-slate-400"
																									/>
																								)}
																							</div>
																							<div className="min-w-0">
																								<p
																									className={`text-xs truncate ${
																										isSelected
																											? "text-white font-bold"
																											: "text-slate-200 font-medium"
																									}`}
																								>
																									{effective.name}
																								</p>
																								<p
																									className={`text-[10px] truncate ${
																										isSelected
																											? "text-white/80"
																											: "text-slate-400"
																									}`}
																								>
																									{effective.station} ·{" "}
																									{effective.members?.length ||
																										0}{" "}
																									members
																								</p>
																							</div>
																						</div>

																						<div className="flex items-center gap-1.5 shrink-0">
																							{/* Unsaved Draft Indicator */}
																							{hasDraft && (
																								<span
																									className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 animate-pulse"
																									title="Has uncommitted draft edits"
																								>
																									<span className="size-1.5 rounded-full bg-amber-400" />
																									Draft
																								</span>
																							)}

																							<span
																								className={`size-2 rounded-full ${
																									effective.status === "Ready"
																										? "bg-[#63b84f]"
																										: effective.status ===
																										  "In progress"
																										? "bg-blue-400"
																										: "bg-amber-400"
																								}`}
																								title={effective.status}
																							/>
																						</div>
																					</button>
																				);
																			})
																		)}
																	</div>
																)}
															</div>
														);
													})
												)}
											</div>
										)}
									</div>
								);
							})
						)}
					</div>
				</div>

				{/* ---------------------------------------------------- */}
				{/* RIGHT COLUMN (lg:col-span-7): TEAM INFO & DRAFT FORM */}
				{/* ---------------------------------------------------- */}
				<div className="lg:col-span-7 rounded-2xl border border-border/70 bg-box-background shadow-xl overflow-hidden flex flex-col">
					{activeTeam ? (
						<div className="p-6 space-y-6">
							{/* Panel Header & Draft Actions */}
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
								<div className="flex items-center gap-3">
									<div className="size-12 rounded-xl overflow-hidden bg-black/40 border border-border shrink-0">
										{activeTeam.image ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={activeTeam.image}
												alt={activeTeam.name}
												className="size-full object-cover"
											/>
										) : (
											<div className="flex size-full items-center justify-center text-slate-500">
												<AdminIcon name="team" className="size-6" />
											</div>
										)}
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h2 className="text-xl font-bold text-white tracking-tight">
												{activeTeam.name}
											</h2>
											{isTeamDirty && (
												<span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[11px] font-bold text-amber-300">
													<span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
													Unsaved Draft
												</span>
											)}
										</div>
										<p className="text-xs text-slate-400 mt-0.5">
											{activeSchool?.name || "School"} · {activeClass?.name || "Class"} ·{" "}
											<span className="text-slate-300">{activeTeam.station}</span>
										</p>
									</div>
								</div>

								{/* Action Buttons: Save & Cancel */}
								<div className="flex items-center gap-2.5">
									<button
										onClick={handleCancelDraft}
										disabled={!isTeamDirty}
										className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
											isTeamDirty
												? "border-border/80 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
												: "border-border/30 text-slate-600 cursor-not-allowed opacity-50"
										}`}
									>
										<AdminIcon name="refresh" className="size-3.5" />
										Cancel / Revert
									</button>
									<button
										onClick={handleSaveTeam}
										disabled={!isTeamDirty}
										className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-md ${
											isTeamDirty
												? "bg-hover text-white hover:bg-[#325d23] ring-1 ring-white/20"
												: "bg-hover/40 text-white/50 cursor-not-allowed"
										}`}
									>
										<AdminIcon name="save" className="size-3.5" />
										Save Team
									</button>
								</div>
							</div>

							{/* Form Fields Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Team Name */}
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
										Team Name
									</label>
									<input
										type="text"
										value={activeTeam.name}
										onChange={(e) => updateActiveTeamField("name", e.target.value)}
										className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
									/>
								</div>

								{/* Status */}
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
										Status
									</label>
									<select
										value={activeTeam.status}
										onChange={(e) =>
											updateActiveTeamField(
												"status",
												e.target.value as Team["status"]
											)
										}
										className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white focus:border-[#63b84f] focus:outline-none"
									>
										<option value="Ready">Ready</option>
										<option value="Needs review">Needs review</option>
										<option value="In progress">In progress</option>
										<option value="Checked in">Checked in</option>
									</select>
								</div>

								{/* Assigned School */}
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
										School
									</label>
									<select
										value={activeTeam.schoolId}
										onChange={(e) => {
											const newSchoolId = Number(e.target.value);
											const possibleClasses = classes.filter(
												(c) => c.schoolId === newSchoolId
											);
											updateActiveTeamField("schoolId", newSchoolId);
											if (possibleClasses.length > 0) {
												updateActiveTeamField("classId", possibleClasses[0].id);
											}
										}}
										className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white focus:border-[#63b84f] focus:outline-none"
									>
										{schools.map((s) => (
											<option key={s.id} value={s.id}>
												{s.name} ({s.city})
											</option>
										))}
									</select>
								</div>

								{/* Assigned Class */}
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
										Class
									</label>
									<select
										value={activeTeam.classId}
										onChange={(e) =>
											updateActiveTeamField("classId", Number(e.target.value))
										}
										className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white focus:border-[#63b84f] focus:outline-none"
									>
										{classes
											.filter((c) => c.schoolId === activeTeam.schoolId)
											.map((c) => (
												<option key={c.id} value={c.id}>
													{c.name} {c.grade ? `(${c.grade})` : ""}
												</option>
											))}
									</select>
								</div>

								{/* Station / Workstation */}
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
										Workstation / Station #
									</label>
									<input
										type="text"
										value={activeTeam.station}
										onChange={(e) => updateActiveTeamField("station", e.target.value)}
										placeholder="e.g. Station 01"
										className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
									/>
								</div>

								{/* Coach / Teacher Name */}
								<div>
									<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
										Coach / Teacher
									</label>
									<input
										type="text"
										value={activeTeam.coachName || ""}
										onChange={(e) => updateActiveTeamField("coachName", e.target.value)}
										placeholder="e.g. Martin Vester"
										className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
									/>
								</div>
							</div>

							{/* Team Image / Avatar Picker */}
							<div className="space-y-2 rounded-xl border border-border/50 bg-background/30 p-4">
								<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
									Team Image & Preset Avatars
								</label>
								<div className="flex flex-col sm:flex-row items-center gap-4">
									<input
										type="text"
										value={activeTeam.image}
										onChange={(e) => updateActiveTeamField("image", e.target.value)}
										placeholder="Paste image URL (https://...)"
										className="flex-1 w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
									/>
									{/* Preset Avatar Pickers */}
									<div className="flex items-center gap-1.5 overflow-x-auto max-w-xs py-1">
										{presetAvatars.map((presetUrl, idx) => (
											<button
												key={idx}
												type="button"
												onClick={() => updateActiveTeamField("image", presetUrl)}
												className={`size-7 rounded-md overflow-hidden border transition-transform shrink-0 ${
													activeTeam.image === presetUrl
														? "border-[#63b84f] scale-110 ring-2 ring-[#63b84f]/40"
														: "border-border hover:border-white/40"
												}`}
											>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={presetUrl}
													alt={`Preset ${idx + 1}`}
													className="size-full object-cover"
												/>
											</button>
										))}
									</div>
								</div>
							</div>

							{/* Team Members List */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
										Team Members ({activeTeam.members?.length || 0})
									</label>
									<span className="text-[11px] text-slate-500">
										Add contestants representing this team
									</span>
								</div>

								{/* Add Member Bar */}
								<form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-2">
									<input
										id={memberInputId}
										type="text"
										value={newMemberName}
										onChange={(e) => setNewMemberName(e.target.value)}
										placeholder="Student / contestant name..."
										className="flex-1 rounded-lg border border-border bg-[#0d122b] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
									/>
									<input
										id={roleInputId}
										type="text"
										value={newMemberRole}
										onChange={(e) => setNewMemberRole(e.target.value)}
										placeholder="Role (e.g. Captain, Driver)..."
										className="w-full sm:w-44 rounded-lg border border-border bg-[#0d122b] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
									/>
									<button
										type="submit"
										className="inline-flex items-center justify-center gap-1 rounded-lg bg-hover px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#325d23] transition-colors shrink-0"
									>
										<AdminIcon name="plus" className="size-3" />
										Add
									</button>
								</form>

								{/* Member Chips / Table */}
								<div className="divide-y divide-border/30 rounded-xl border border-border/50 bg-[#0d122b] overflow-hidden max-h-48 overflow-y-auto">
									{(!activeTeam.members || activeTeam.members.length === 0) ? (
										<div className="p-4 text-center text-xs text-slate-500">
											No members registered yet. Add members using the input above.
										</div>
									) : (
										activeTeam.members.map((member) => (
											<div
												key={member.id}
												className="flex items-center justify-between px-3.5 py-2 hover:bg-white/[0.02] text-xs transition-colors"
											>
												<div className="flex items-center gap-2.5">
													<AdminIcon name="user" className="size-3.5 text-slate-400" />
													<span className="font-semibold text-white">
														{member.name}
													</span>
													{member.role && (
														<span className="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] text-slate-300">
															{member.role}
														</span>
													)}
												</div>
												<button
													type="button"
													onClick={() => handleRemoveMember(member.id)}
													className="rounded p-1 text-slate-500 hover:text-red-400 transition-colors"
													title="Remove member"
												>
													<AdminIcon name="trash" className="size-3.5" />
												</button>
											</div>
										))
									)}
								</div>
							</div>

							{/* Notes & Strategy */}
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
									Admin Notes & Strategy
								</label>
								<textarea
									rows={3}
									value={activeTeam.notes}
									onChange={(e) => updateActiveTeamField("notes", e.target.value)}
									placeholder="Special equipment notes, technical inspection notes, reminders..."
									className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none resize-none"
								/>
							</div>
						</div>
					) : (
						<div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
							<AdminIcon name="team" className="size-12 mb-3 opacity-30" />
							<p className="text-sm font-semibold text-white">No team selected</p>
							<p className="text-xs text-slate-400 mt-1">
								Select a team from the tree on the left to inspect and edit its details.
							</p>
						</div>
					)}
				</div>
			</div>

			{/* ======================================================== */}
			{/* MODAL DIALOG FOR ADDING SCHOOL / CLASS / TEAM            */}
			{/* ======================================================== */}
			{addModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-2xl border border-border bg-box-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
						<div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
							<h3 className="text-base font-bold text-white">
								{addModal.type === "school" && "Add School to Event"}
								{addModal.type === "class" && `Add Class to ${addModal.schoolName}`}
								{addModal.type === "team" && `Create Team in ${addModal.className}`}
							</h3>
							<button
								onClick={() => {
									setAddModal(null);
									setModalName("");
								}}
								className="text-slate-400 hover:text-white"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleModalSubmit} className="space-y-4">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
									{addModal.type === "school" && "School Name"}
									{addModal.type === "class" && "Class Name (e.g. Class 8A)"}
									{addModal.type === "team" && "Team Name"}
								</label>
								<input
									type="text"
									required
									autoFocus
									value={modalName}
									onChange={(e) => setModalName(e.target.value)}
									placeholder={
										addModal.type === "school"
											? "e.g. Northstar Technical Institute"
											: addModal.type === "class"
											? "e.g. Class 9A"
											: "e.g. Team Phoenix"
									}
									className="w-full rounded-lg border border-border bg-[#0d122b] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#63b84f] focus:outline-none"
								/>
							</div>

							<div className="flex justify-end gap-2.5 pt-2">
								<button
									type="button"
									onClick={() => {
										setAddModal(null);
										setModalName("");
									}}
									className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="rounded-lg bg-hover px-4 py-2 text-xs font-bold text-white hover:bg-[#325d23]"
								>
									Create
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default function TeamsPage() {
	return (
		<Suspense fallback={<div className="p-8 text-center text-slate-400">Loading competition teams...</div>}>
			<TeamsPageContent />
		</Suspense>
	);
}
