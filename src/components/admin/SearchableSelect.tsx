"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { IconCheck, IconChevronDown, IconPlus, IconX } from "@tabler/icons-react";
import { cn } from "tailwind-variants";
import textField from "@/components/admin/TextField";

export interface SearchableSelectOption<T = string | number> {
	value: T;
	label: string;
	subLabel?: string;
	icon?: React.ReactNode;
	disabled?: boolean;
}

export interface SearchableSelectProps<T = string | number> {
	id?: string;
	value: T | null | undefined;
	onChange: (value: T) => void;
	options: SearchableSelectOption<T>[];
	placeholder?: string;
	searchPlaceholder?: string;
	className?: string;
	disabled?: boolean;
	required?: boolean;
	allowCustom?: boolean;
	customCreateLabel?: (text: string) => string;
	leftIcon?: React.ReactNode;
	emptyText?: string;
	noResultsText?: string;
}

export default function SearchableSelect<T = string | number>({
	id,
	value,
	onChange,
	options,
	placeholder = "Vælg...",
	className,
	disabled = false,
	required = false,
	allowCustom = false,
	customCreateLabel,
	leftIcon,
	emptyText = "Ingen valgmuligheder tilgængelige",
	noResultsText = "Ingen resultater fundet",
}: SearchableSelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState<string | null>(null);
	const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement>(null);

	// Find the currently selected option
	const selectedOption = useMemo(() => {
		if (value === null || value === undefined) return null;
		return options.find((opt) => opt.value === value) || null;
	}, [options, value]);

	// When allowCustom is true, value might be a custom string not in options
	const displayValue = useMemo(() => {
		if (searchQuery !== null) return searchQuery;
		if (selectedOption) return selectedOption.label;
		if (allowCustom && typeof value === "string" && value) return value;
		return "";
	}, [searchQuery, selectedOption, allowCustom, value]);

	// Filter options based on search query
	const filteredOptions = useMemo(() => {
		if (!searchQuery || !searchQuery.trim()) return options;
		const q = searchQuery.toLowerCase().trim();
		return options.filter(
			(opt) =>
				opt.label.toLowerCase().includes(q) ||
				(opt.subLabel && opt.subLabel.toLowerCase().includes(q))
		);
	}, [options, searchQuery]);

	// Check if search query is a new custom entry
	const isNewCustom = useMemo(() => {
		if (!allowCustom || !searchQuery || !searchQuery.trim()) return false;
		const trimmed = searchQuery.trim().toLowerCase();
		return !options.some(
			(opt) =>
				String(opt.value).toLowerCase() === trimmed ||
				opt.label.toLowerCase() === trimmed
		);
	}, [allowCustom, searchQuery, options]);

	// Close when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setSearchQuery(null);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Keep highlighted index within bounds
	useEffect(() => {
		setHighlightedIndex(0);
	}, [filteredOptions, isNewCustom]);

	const handleSelectOption = (opt: SearchableSelectOption<T>) => {
		if (opt.disabled) return;
		onChange(opt.value);
		setSearchQuery(null);
		setIsOpen(false);
	};

	const handleSelectCustom = (customText: string) => {
		const trimmed = customText.trim();
		if (!trimmed) return;
		// Cast string to T
		onChange(trimmed as unknown as T);
		setSearchQuery(null);
		setIsOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (disabled) return;

		if (e.key === "Escape") {
			setIsOpen(false);
			setSearchQuery(null);
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			if (!isOpen) {
				setIsOpen(true);
			} else {
				const maxIndex = filteredOptions.length + (isNewCustom ? 1 : 0) - 1;
				setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
			}
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			if (!isOpen) {
				setIsOpen(true);
			} else {
				const maxIndex = filteredOptions.length + (isNewCustom ? 1 : 0) - 1;
				setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
			}
		} else if (e.key === "Enter") {
			if (!isOpen) {
				setIsOpen(true);
				return;
			}
			e.preventDefault();
			if (isNewCustom && highlightedIndex === 0) {
				handleSelectCustom(searchQuery || "");
			} else {
				const optionIndex = isNewCustom ? highlightedIndex - 1 : highlightedIndex;
				if (filteredOptions[optionIndex]) {
					handleSelectOption(filteredOptions[optionIndex]);
				} else if (allowCustom && searchQuery && searchQuery.trim()) {
					handleSelectCustom(searchQuery);
				}
			}
		}
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (allowCustom) {
			onChange("" as unknown as T);
		}
		setSearchQuery("");
		if (!isOpen) setIsOpen(true);
		inputRef.current?.focus();
	};

	return (
		<div ref={containerRef} className={cn("relative w-full", className)}>
			<div className="relative flex items-center">
				{leftIcon && (
					<div className="absolute left-3.5 text-slate-400 pointer-events-none z-10">
						{leftIcon}
					</div>
				)}

				<input
					ref={inputRef}
					id={id}
					type="text"
					required={required && !value && value !== 0}
					disabled={disabled}
					value={displayValue}
					placeholder={placeholder}
					onChange={(e) => {
						const val = e.target.value;
						setSearchQuery(val);
						if (!isOpen) setIsOpen(true);
						if (allowCustom) {
							onChange(val as unknown as T);
						}
					}}
					onFocus={() => {
						if (!disabled) {
							setIsOpen(true);
						}
					}}
					onKeyDown={handleKeyDown}
					className={cn(
						textField(),
						"w-full py-2.5 text-sm transition-all",
						leftIcon ? "pl-10" : "pl-3.5",
						displayValue ? "pr-16" : "pr-9",
						disabled && "opacity-60 cursor-not-allowed bg-slate-100"
					)}
				/>

				<div className="absolute right-2 flex items-center gap-0.5">
					{displayValue && !disabled && (
						<button
							type="button"
							tabIndex={-1}
							onClick={handleClear}
							className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
							aria-label="Ryd felt"
						>
							<IconX size={14} />
						</button>
					)}
					<button
						type="button"
						tabIndex={-1}
						disabled={disabled}
						onClick={() => {
							if (!disabled) {
								if (isOpen) {
									setIsOpen(false);
									setSearchQuery(null);
								} else {
									setIsOpen(true);
									inputRef.current?.focus();
								}
							}
						}}
						className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
						aria-label="Åbn dropdown"
					>
						<IconChevronDown
							size={18}
							className={cn(
								"transition-transform duration-200",
								isOpen && "rotate-180 text-slate-700"
							)}
						/>
					</button>
				</div>
			</div>

			{/* Dropdown menu */}
			{isOpen && !disabled && (
				<ul
					ref={listRef}
					className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
				>
					{/* Creatable / Custom option item */}
					{isNewCustom && searchQuery && searchQuery.trim() && (
						<li
							onClick={() => handleSelectCustom(searchQuery)}
							onMouseEnter={() => setHighlightedIndex(0)}
							className={cn(
								"px-3.5 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 cursor-pointer border-b border-slate-100 flex items-center gap-2 transition-colors",
								highlightedIndex === 0 && "bg-emerald-100"
							)}
						>
							<IconPlus size={15} className="shrink-0 text-emerald-600" />
							<span className="truncate">
								{customCreateLabel
									? customCreateLabel(searchQuery.trim())
									: `Opret ny: "${searchQuery.trim()}"`}
							</span>
						</li>
					)}

					{/* Options list */}
					{filteredOptions.length > 0 ? (
						filteredOptions.map((opt, idx) => {
							const itemIndex = isNewCustom ? idx + 1 : idx;
							const isSelected = value === opt.value;
							const isHighlighted = highlightedIndex === itemIndex;

							return (
								<li
									key={String(opt.value)}
									onClick={() => handleSelectOption(opt)}
									onMouseEnter={() => setHighlightedIndex(itemIndex)}
									className={cn(
										"flex items-center justify-between px-3.5 py-2 text-sm cursor-pointer transition-colors",
										opt.disabled
											? "opacity-50 cursor-not-allowed bg-slate-50"
											: isHighlighted
											? "bg-slate-100 text-slate-900"
											: "hover:bg-slate-50 text-slate-700",
										isSelected && "bg-slate-50 font-semibold text-slate-900"
									)}
								>
									<div className="flex items-center gap-2.5 min-w-0 pr-2">
										{opt.icon && (
											<span
												className={cn(
													"shrink-0",
													isSelected ? "text-emerald-600" : "text-slate-400"
												)}
											>
												{opt.icon}
											</span>
										)}
										<div className="flex flex-col min-w-0">
											<span className="truncate text-slate-800 font-medium">
												{opt.label}
											</span>
											{opt.subLabel && (
												<span className="text-xs text-slate-400 font-normal truncate">
													{opt.subLabel}
												</span>
											)}
										</div>
									</div>

									{isSelected && (
										<IconCheck size={16} className="text-emerald-600 shrink-0 ml-2" />
									)}
								</li>
							);
						})
					) : (
						!isNewCustom && (
							<li className="px-4 py-3 text-xs text-slate-400 text-center">
								{options.length === 0 ? emptyText : noResultsText}
							</li>
						)
					)}
				</ul>
			)}
		</div>
	);
}
