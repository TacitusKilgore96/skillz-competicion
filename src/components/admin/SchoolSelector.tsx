"use client";

import React, { useMemo } from "react";
import { IconBuildingCommunity } from "@tabler/icons-react";
import SearchableSelect, { SearchableSelectOption } from "@/components/admin/SearchableSelect";

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
	const options: SearchableSelectOption<string>[] = useMemo(() => {
		return existingSchools.map((s) => ({
			value: s,
			label: s,
			icon: <IconBuildingCommunity size={16} />,
		}));
	}, [existingSchools]);

	return (
		<SearchableSelect<string>
			value={value}
			onChange={onChange}
			options={options}
			placeholder={placeholder}
			className={className}
			disabled={disabled}
			required={required}
			allowCustom={true}
			customCreateLabel={(text) => `Opret som ny skole: "${text}"`}
			leftIcon={<IconBuildingCommunity size={18} />}
			emptyText="Ingen eksisterende skoler oprettet endnu. Skriv blot et skolenavn her for at oprette den."
			noResultsText="Ingen matchende skoler fundet"
		/>
	);
}
