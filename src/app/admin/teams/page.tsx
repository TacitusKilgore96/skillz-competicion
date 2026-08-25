"use client";

import React, { Fragment, useState } from "react";
import { cn } from "tailwind-variants";

interface Team {
    id: number;
    name: string;
}

interface ClassItem {
    id: number;
    name: string;
    teams: Team[];
}

interface School {
    id: number;
    name: string;
    classes: ClassItem[];
}

const initialSchools: School[] = [
    {
        id: 1,
        name: "School 1",
        classes: [
            {
                id: 1,
                name: "Class 1",
                teams: [
                    {
                        id: 1,
                        name: "Team 1"
                    }
                ]
            },
            {
                id: 2,
                name: "Class 2",
                teams: [
                    {
                        id: 2,
                        name: "Team 1"
                    }
                ]
            },
            {
                id: 3,
                name: "Class 3",
                teams: [
                    {
                        id: 3,
                        name: "Team 1"
                    },
                    {
                        id: 4,
                        name: "Team 2"
                    },
                    {
                        id: 5,
                        name: "Team 3"
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        name: "School 2",
        classes: [
            {
                id: 4,
                name: "Class 1",
                teams: [
                    {
                        id: 6,
                        name: "Team 1"
                    }
                ]
            }
        ]
    }
];

type ModalState =
    | { type: "add-school" }
    | { type: "add-class"; schoolId: number; schoolName: string }
    | { type: "add-team"; schoolId: number; classId: number; className: string }
    | { type: "edit"; itemType: "School" | "Class" | "Team"; id: number; currentName: string; parentSchoolId?: number; parentClassId?: number }
    | null;

export default function TeamsPage() {
    const [schools, setSchools] = useState<School[]>(initialSchools);
    const [modal, setModal] = useState<ModalState>(null);
    const [openSchools, setOpenSchools] = useState<Record<number, boolean>>({});
    const [openClasses, setOpenClasses] = useState<Record<number, boolean>>({});

    const toggleSchool = (schoolId: number) => {
        setOpenSchools((prev) => ({ ...prev, [schoolId]: !prev[schoolId] }));
    };

    const toggleClass = (classId: number) => {
        setOpenClasses((prev) => ({ ...prev, [classId]: !prev[classId] }));
    };

    const handleAddSchool = (name: string) => {
        const newSchool: School = {
            id: Date.now(),
            name,
            classes: []
        };
        setSchools((prev) => [...prev, newSchool]);
        setModal(null);
    };

    const handleAddClass = (schoolId: number, name: string) => {
        const newClass: ClassItem = {
            id: Date.now(),
            name,
            teams: []
        };
        setSchools((prev) =>
            prev.map((school) => {
                if (school.id !== schoolId) return school;
                return {
                    ...school,
                    classes: [...school.classes, newClass]
                };
            })
        );
        // Automatically open the school so the new class is visible
        setOpenSchools((prev) => ({ ...prev, [schoolId]: true }));
        setModal(null);
    };

    const handleAddTeam = (schoolId: number, classId: number, name: string) => {
        const newTeam: Team = {
            id: Date.now(),
            name
        };
        setSchools((prev) =>
            prev.map((school) => {
                if (school.id !== schoolId) return school;
                return {
                    ...school,
                    classes: school.classes.map((cls) => {
                        if (cls.id !== classId) return cls;
                        return {
                            ...cls,
                            teams: [...cls.teams, newTeam]
                        };
                    })
                };
            })
        );
        // Automatically open both school and class so the new team is visible
        setOpenSchools((prev) => ({ ...prev, [schoolId]: true }));
        setOpenClasses((prev) => ({ ...prev, [classId]: true }));
        setModal(null);
    };

    const handleEdit = (
        itemType: "School" | "Class" | "Team",
        id: number,
        newName: string,
        parentSchoolId?: number,
        parentClassId?: number
    ) => {
        if (itemType === "School") {
            setSchools((prev) =>
                prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
            );
        } else if (itemType === "Class" && parentSchoolId !== undefined) {
            setSchools((prev) =>
                prev.map((s) => {
                    if (s.id !== parentSchoolId) return s;
                    return {
                        ...s,
                        classes: s.classes.map((c) => (c.id === id ? { ...c, name: newName } : c))
                    };
                })
            );
        } else if (itemType === "Team" && parentSchoolId !== undefined && parentClassId !== undefined) {
            setSchools((prev) =>
                prev.map((s) => {
                    if (s.id !== parentSchoolId) return s;
                    return {
                        ...s,
                        classes: s.classes.map((c) => {
                            if (c.id !== parentClassId) return c;
                            return {
                                ...c,
                                teams: c.teams.map((t) => (t.id === id ? { ...t, name: newName } : t))
                            };
                        })
                    };
                })
            );
        }
        setModal(null);
    };

    const handleDeleteSchool = (schoolId: number) => {
        setSchools((prev) => prev.filter((s) => s.id !== schoolId));
    };

    const handleDeleteClass = (schoolId: number, classId: number) => {
        setSchools((prev) =>
            prev.map((s) => {
                if (s.id !== schoolId) return s;
                return {
                    ...s,
                    classes: s.classes.filter((c) => c.id !== classId)
                };
            })
        );
    };

    const handleDeleteTeam = (schoolId: number, classId: number, teamId: number) => {
        setSchools((prev) =>
            prev.map((s) => {
                if (s.id !== schoolId) return s;
                return {
                    ...s,
                    classes: s.classes.map((c) => {
                        if (c.id !== classId) return c;
                        return {
                            ...c,
                            teams: c.teams.filter((t) => t.id !== teamId)
                        };
                    })
                };
            })
        );
    };

    return (
        <Fragment>
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#6c8a62]">Manage</p>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-200">Schools & Teams</h1>
                    <p className="mt-2 text-sm text-slate-400">Manage the Schools, Classes and Teams</p>
                </div>
                <button
                    type="button"
                    onClick={() => setModal({ type: "add-school" })}
                    className="rounded-lg bg-[#5d8254] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#4c7045] transition-colors cursor-pointer"
                >
                    + Add School
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e6e9ed] bg-white shadow-[0_2px_5px_rgba(25,32,44,.03)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-155 text-left text-sm">
                        <thead className="bg-[#fafbfc] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-5 py-3.5">Name</th>
                                <th className="px-5 py-3.5">Type</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf0f2]">
                            {schools.map((school) => (
                                <SchoolRow
                                    key={school.id}
                                    school={school}
                                    isOpen={!!openSchools[school.id]}
                                    onToggle={() => toggleSchool(school.id)}
                                    openClasses={openClasses}
                                    onToggleClass={toggleClass}
                                    onAddClass={() => setModal({ type: "add-class", schoolId: school.id, schoolName: school.name })}
                                    onAddTeam={(classId, className) =>
                                        setModal({ type: "add-team", schoolId: school.id, classId, className })
                                    }
                                    onEditSchool={() =>
                                        setModal({ type: "edit", itemType: "School", id: school.id, currentName: school.name })
                                    }
                                    onEditClass={(classItem) =>
                                        setModal({
                                            type: "edit",
                                            itemType: "Class",
                                            id: classItem.id,
                                            currentName: classItem.name,
                                            parentSchoolId: school.id
                                        })
                                    }
                                    onEditTeam={(classId, team) =>
                                        setModal({
                                            type: "edit",
                                            itemType: "Team",
                                            id: team.id,
                                            currentName: team.name,
                                            parentSchoolId: school.id,
                                            parentClassId: classId
                                        })
                                    }
                                    onDeleteSchool={() => handleDeleteSchool(school.id)}
                                    onDeleteClass={(classId) => handleDeleteClass(school.id, classId)}
                                    onDeleteTeam={(classId, teamId) => handleDeleteTeam(school.id, classId, teamId)}
                                />
                            ))}
                            {schools.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-10 text-center text-sm text-slate-400">
                                        No schools found. Click &quot;+ Add School&quot; to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <ItemModal
                    modal={modal}
                    onClose={() => setModal(null)}
                    onAddSchool={handleAddSchool}
                    onAddClass={handleAddClass}
                    onAddTeam={handleAddTeam}
                    onEdit={handleEdit}
                />
            )}
        </Fragment>
    );
}

function ChevronIcon({ open, className }: { open: boolean; className?: string }) {
    return (
        <svg
            aria-hidden="true"
            className={cn("size-4 shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-90", className)}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    );
}

interface SchoolRowProps {
    school: School;
    isOpen: boolean;
    onToggle: () => void;
    openClasses: Record<number, boolean>;
    onToggleClass: (classId: number) => void;
    onAddClass: () => void;
    onAddTeam: (classId: number, className: string) => void;
    onEditSchool: () => void;
    onEditClass: (classItem: ClassItem) => void;
    onEditTeam: (classId: number, team: Team) => void;
    onDeleteSchool: () => void;
    onDeleteClass: (classId: number) => void;
    onDeleteTeam: (classId: number, teamId: number) => void;
}

function SchoolRow({
    school,
    isOpen,
    onToggle,
    openClasses,
    onToggleClass,
    onAddClass,
    onAddTeam,
    onEditSchool,
    onEditClass,
    onEditTeam,
    onDeleteSchool,
    onDeleteClass,
    onDeleteTeam
}: SchoolRowProps) {
    const hasChildren = school.classes && school.classes.length > 0;

    return (
        <Fragment>
            <tr
                onClick={() => hasChildren && onToggle()}
                className={cn(
                    "group transition-colors",
                    hasChildren ? "cursor-pointer hover:bg-slate-50/80" : "hover:bg-slate-50/40",
                    "bg-white"
                )}
            >
                <td className="px-5 py-3.5 font-semibold text-[#293546]">
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggle();
                                }}
                                className="flex size-6 items-center justify-center rounded hover:bg-slate-200/60 focus:outline-none cursor-pointer"
                                aria-label={isOpen ? "Collapse school" : "Expand school"}
                            >
                                <ChevronIcon open={isOpen} />
                            </button>
                        ) : (
                            <span className="inline-block size-6" />
                        )}
                        <span>{school.name}</span>
                        <span className="text-xs font-normal text-slate-400">
                            ({school.classes.length} {school.classes.length === 1 ? "class" : "classes"})
                        </span>
                    </div>
                </td>
                <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        School
                    </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-3 text-xs font-bold" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={onAddClass}
                            className="inline-flex items-center gap-1 rounded bg-[#5d8254]/10 px-2.5 py-1 text-xs font-bold text-[#5d8254] hover:bg-[#5d8254]/20 transition-colors cursor-pointer"
                        >
                            + Add Class
                        </button>
                        <button
                            type="button"
                            onClick={onEditSchool}
                            className="text-[#5d8254] hover:underline cursor-pointer"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={onDeleteSchool}
                            className="text-[#bd6868] hover:underline cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>

            {isOpen &&
                school.classes.map((cls) => (
                    <ClassRow
                        key={cls.id}
                        classItem={cls}
                        isOpen={!!openClasses[cls.id]}
                        onToggle={() => onToggleClass(cls.id)}
                        onAddTeam={() => onAddTeam(cls.id, cls.name)}
                        onEditClass={() => onEditClass(cls)}
                        onEditTeam={(team) => onEditTeam(cls.id, team)}
                        onDeleteClass={() => onDeleteClass(cls.id)}
                        onDeleteTeam={(teamId) => onDeleteTeam(cls.id, teamId)}
                    />
                ))}
        </Fragment>
    );
}

interface ClassRowProps {
    classItem: ClassItem;
    isOpen: boolean;
    onToggle: () => void;
    onAddTeam: () => void;
    onEditClass: () => void;
    onEditTeam: (team: Team) => void;
    onDeleteClass: () => void;
    onDeleteTeam: (teamId: number) => void;
}

function ClassRow({
    classItem,
    isOpen,
    onToggle,
    onAddTeam,
    onEditClass,
    onEditTeam,
    onDeleteClass,
    onDeleteTeam
}: ClassRowProps) {
    const hasChildren = classItem.teams && classItem.teams.length > 0;

    return (
        <Fragment>
            <tr
                onClick={() => hasChildren && onToggle()}
                className={cn(
                    "group transition-colors",
                    hasChildren ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50/70",
                    "bg-slate-50/40"
                )}
            >
                <td className="py-3 pr-5 font-medium text-slate-700" style={{ paddingLeft: "2.75rem" }}>
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggle();
                                }}
                                className="flex size-6 items-center justify-center rounded hover:bg-slate-200/60 focus:outline-none cursor-pointer"
                                aria-label={isOpen ? "Collapse class" : "Expand class"}
                            >
                                <ChevronIcon open={isOpen} />
                            </button>
                        ) : (
                            <span className="inline-block size-6" />
                        )}
                        <span>{classItem.name}</span>
                        <span className="text-xs font-normal text-slate-400">
                            ({classItem.teams.length} {classItem.teams.length === 1 ? "team" : "teams"})
                        </span>
                    </div>
                </td>
                <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        Class
                    </span>
                </td>
                <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3 text-xs font-bold" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={onAddTeam}
                            className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                            + Add Team
                        </button>
                        <button
                            type="button"
                            onClick={onEditClass}
                            className="text-[#5d8254] hover:underline cursor-pointer"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={onDeleteClass}
                            className="text-[#bd6868] hover:underline cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>

            {isOpen &&
                classItem.teams.map((team) => (
                    <TeamRow
                        key={team.id}
                        team={team}
                        onEditTeam={() => onEditTeam(team)}
                        onDeleteTeam={() => onDeleteTeam(team.id)}
                    />
                ))}
        </Fragment>
    );
}

interface TeamRowProps {
    team: Team;
    onEditTeam: () => void;
    onDeleteTeam: () => void;
}

function TeamRow({ team, onEditTeam, onDeleteTeam }: TeamRowProps) {
    return (
        <tr className="bg-slate-100/30 hover:bg-slate-100/60 transition-colors">
            <td className="py-2.5 pr-5 text-slate-600" style={{ paddingLeft: "4.75rem" }}>
                <div className="flex items-center gap-2.5">
                    <span className="size-1.5 rounded-full bg-purple-400" />
                    <span>{team.name}</span>
                </div>
            </td>
            <td className="px-5 py-2.5">
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                    Team
                </span>
            </td>
            <td className="px-5 py-2.5 text-right">
                <div className="flex items-center justify-end gap-3 text-xs font-bold" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        onClick={onEditTeam}
                        className="text-[#5d8254] hover:underline cursor-pointer"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={onDeleteTeam}
                        className="text-[#bd6868] hover:underline cursor-pointer"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
}

interface ItemModalProps {
    modal: NonNullable<ModalState>;
    onClose: () => void;
    onAddSchool: (name: string) => void;
    onAddClass: (schoolId: number, name: string) => void;
    onAddTeam: (schoolId: number, classId: number, name: string) => void;
    onEdit: (
        itemType: "School" | "Class" | "Team",
        id: number,
        name: string,
        parentSchoolId?: number,
        parentClassId?: number
    ) => void;
}

function ItemModal({
    modal,
    onClose,
    onAddSchool,
    onAddClass,
    onAddTeam,
    onEdit
}: ItemModalProps) {
    const initialName = modal.type === "edit" ? modal.currentName : "";
    const [name, setName] = useState(initialName);

    let title = "";
    let subtitle = "";
    let placeholder = "";
    let submitLabel = "";

    if (modal.type === "add-school") {
        title = "Add School";
        subtitle = "Enter the name of the new school.";
        placeholder = "e.g. Westside High School";
        submitLabel = "Add School";
    } else if (modal.type === "add-class") {
        title = `Add Class to ${modal.schoolName}`;
        subtitle = "Enter the name of the new class.";
        placeholder = "e.g. Class 4";
        submitLabel = "Add Class";
    } else if (modal.type === "add-team") {
        title = `Add Team to ${modal.className}`;
        subtitle = "Enter the name of the new team.";
        placeholder = "e.g. Team Alpha";
        submitLabel = "Add Team";
    } else if (modal.type === "edit") {
        title = `Edit ${modal.itemType}`;
        subtitle = `Update the name for this ${modal.itemType.toLowerCase()}.`;
        placeholder = `Enter ${modal.itemType.toLowerCase()} name`;
        submitLabel = "Save Changes";
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;

        if (modal.type === "add-school") {
            onAddSchool(trimmed);
        } else if (modal.type === "add-class") {
            onAddClass(modal.schoolId, trimmed);
        } else if (modal.type === "add-team") {
            onAddTeam(modal.schoolId, modal.classId, trimmed);
        } else if (modal.type === "edit") {
            onEdit(modal.itemType, modal.id, trimmed, modal.parentSchoolId, modal.parentClassId);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#182231]/40 p-4 backdrop-blur-xs">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#293546]">{title}</h2>
                        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-600">
                        Name
                        <input
                            required
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={placeholder}
                            className="mt-2 w-full rounded-lg border border-[#dfe4e9] px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-[#6c8a62] focus:ring-1 focus:ring-[#6c8a62]"
                        />
                    </label>
                </div>

                <div className="mt-7 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-lg bg-[#5d8254] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#4c7045] transition-colors cursor-pointer"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}
