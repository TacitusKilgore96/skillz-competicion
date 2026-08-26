"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import textField from "@/components/admin/TextField";
import {iconButton} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {getEvents} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {usePathname} from "next/navigation";
import Link from "next/link";

export default function Page() {
	const {data, loading, error} = useAsync<EventModel[]>(async () => getEvents(), []);
	const pathname = usePathname()

	return (
		<AdminShell pageTitle={"Begivenheder"} currentPath={"/admin/events"}>
			<div className={"flex h-full"}>
				{/* list area */}
				<div className={"flex-1 p-4 h-full flex flex-col items-center gap-4 max-w-120 border-r border-gray-300"}>
					<div className={"w-full flex justify-between"}>
						<input className={textField()} placeholder={"Søg..."}/>

						<button className={cn(iconButton(), "uppercase font-semibold p-1 text-2xl")}>+</button>
					</div>

					<div className={"w-full h-full overflow-y-scroll flex flex-col p-2"}>
						<div className={"flex flex-col p-2 border-b border-gray-300 font-bold"}>
							<p>Navn</p>
						</div>

						<AsyncDataRenderer
							loading={loading}
							error={error}
							data={data}

							renderData={events => events!.map(event => (
								<Link key={event.id} href={`/admin/events/${event.id}`}
								   className={cn(
									   "items-center px-2 py-4 border-b border-gray-300 relative",
									   pathname.startsWith(`/admin/events/${event.id}`) ?
										   cn(
											   "before:absolute before:-z-1 before:inset-0 before:bg-gray-100",
											   "before:-top-2 before:-bottom-2 before:-right-2 before:-left-2 before:rounded-xl"
										   ) : ""
								   )}>
									<p className={"font-medium"}>{event.name}</p>
								</Link>
							))}
						/>
					</div>
				</div>

				{/* Edit area */}
				<div className={"flex-1"}>

				</div>
			</div>
		</AdminShell>
	)
}