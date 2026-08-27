"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { IconBuildingCommunity, IconCheck, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { cn } from "tailwind-variants";
import textField from "@/components/admin/TextField";

interface SchoolSelectorProps {
	value: string;
	onChange: (school: string) => void;
	existingSchools: string[];
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	required?: boolean;
}

export default function SchoolSelector({
	value,
	onChange,
	existingSchools,
	placeholder = "Indtast eller vælg skole...",
	className,
	disabled = false,
	required = false,
}: SchoolSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Close on outside click
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Filter schools matching the current input value
	const filteredSchools = useMemo(() => {
		if (!value || !value.trim()) return existingSchools;
		const query = value.toLowerCase().trim();
		return existingSchools.filter((school) => school.toLowerCase().includes(query));
	}, [existingSchools, value]);

	const isNewSchool = useMemo(() => {
		const trimmed = value.trim();
		if (!trimmed) return false;
		return !existingSchools.some((s) => s.toLowerCase() === trimmed.toLowerCase());
	}, [existingSchools, value]);

	const handleSelect = (school: string) => {
		onChange(school);
		setIsOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			setIsOpen(false);
		} else if (e.key === "ArrowDown") {
			if (!isOpen) setIsOpen(true);
		} else if (e.key === "Enter") {
			if (isOpen && filteredSchools.length > 0) {
				e.preventDefault();
				handleSelect(filteredSchools[0]);
			}
		}
	};

	return (
		<div ref={containerRef} className={cn("relative w-full", className)}>
			<div className="relative flex items-center">
				<div className="absolute left-3.5 text-slate-400 pointer-events-none">
					<IconBuildingCommunity size={18} />
				</div>
				<input
					ref={inputRef}
					type="text"
					required={required}
					disabled={disabled}
					value={value}
					placeholder={placeholder}
					onChange={(e) => {
						onChange(e.target.value);
						if (!isOpen) setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					onKeyDown={handleKeyDown}
					className={cn(
						textField(),
						"w-full pl-10 pr-9 py-2.5 text-sm",
						disabled && "opacity-60 cursor-not-allowed"
					)}
				/>
				<button
					type="button"
					tabIndex={-1}
					disabled={disabled}
					onClick={() => {
						if (!disabled) {
							setIsOpen(!isOpen);
							if (!isOpen) inputRef.current?.focus();
						}
					}}
					className="absolute right-2.5 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
					aria-label="Åbn skoleliste"
				>
					<IconChevronDown
						size={18}
						className={cn("transition-transform duration-200", isOpen && "rotate-180")}
					/>
				</button>
			</div>

			{/* Dropdown Suggestions */}
			{isOpen && !disabled && (
				<ul className="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl">
					{existingSchools.length === 0 && !value.trim() ? (
						<li className="px-4 py-3 text-xs text-slate-400 text-center">
							Ingen eksisterende skoler oprettet endnu. Skriv blot et skolenavn her for at oprette den.
						</li>
					) : (
						<>
							{/* New school creation suggestion chip */}
							{isNewSchool && value.trim() && (
								<li
									onClick={() => handleSelect(value.trim())}
									className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 cursor-pointer border-b border-slate-100 flex items-center gap-2"
								>
									<IconPlus size={14} className="shrink-0 text-emerald-600" />
									<span className="truncate">
										Opret som ny skole: &quot;<span className="underline">{value.trim()}</span>&quot;
									</span>
								</li>
							)}

							{/* Existing filtered schools */}
							{filteredSchools.map((school) => {
								const isSelected = value.trim().toLowerCase() === school.toLowerCase();
								return (
									<li
										key={school}
										onClick={() => handleSelect(school)}
										className={cn(
											"flex items-center justify-between px-3.5 py-2 text-sm cursor-pointer transition-colors hover:bg-slate-100",
											isSelected && "bg-slate-50 font-semibold text-slate-900"
										)}
									>
										<div className="flex items-center gap-2.5 min-w-0">
											<IconBuildingCommunity
												size={16}
												className={cn(isSelected ? "text-emerald-600" : "text-slate-400")}
											/>
											<span className="truncate text-slate-800">{school}</span>
										</div>
										{isSelected && <IconCheck size={16} className="text-emerald-600 shrink-0" />}
									</li>
								);
							})}

							{filteredSchools.length === 0 && !isNewSchool && (
								<li className="px-4 py-2.5 text-xs text-slate-400 text-center">
									Ingen matchende skoler fundet
								</li>
							)}
						</>
					)}
				</ul>
			)}
		</div>
	);
}
