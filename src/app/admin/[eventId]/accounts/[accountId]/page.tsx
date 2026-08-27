"use client"
import {EventShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {iconButton} from "@/components/admin/Button";
import {IconPlus} from "@tabler/icons-react";
import {useParams} from "next/navigation";

export default function EventPage() {
	const {accountId} = useParams();

	return (
		<EventShell pageTitle={"Kontoer"}>
			<div className={"flex h-full w-full"}>
				<aside className={"shrink-0 h-full w-100 p-4 border-r border-gray-300"}>
					<div className={"flex gap-2"}>
						<input type="search" className={cn(textField(), "w-full")} placeholder={"Søg..."}/>
						<button className={cn(iconButton())}>
							<IconPlus/>
						</button>
					</div>

					<ul className={"flex flex-col gap-2"}>
						{
							(
								<li>

								</li>
							)
						}
					</ul>
				</aside>

				<div className={"flex-1 w-full"}>

				</div>
			</div>
		</EventShell>
	);
}