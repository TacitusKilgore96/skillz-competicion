"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import card from "@/components/admin/Card";
import textField from "@/components/admin/TextField";
import {button, iconButton} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {getEvents} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import {IconEdit} from '@tabler/icons-react';

export default function Page() {
	const {data, loading, error} = useAsync<EventModel[]>(async () => getEvents(), []);

	return (
		<AdminShell pageTitle={"Begivenheder"} currentPath={"/admin/events"}>
			<div className={"flex"}>
				{/* list area */}
				<div className={"flex-1 p-4 h-full flex flex-col items-center gap-4 max-w-120 border-r border-gray-300"}>
					<div className={"w-full flex justify-between"}>
						<input className={textField()} placeholder={"Søg..."}/>

						<button className={cn(iconButton(), "uppercase font-semibold p-1 text-2xl")}>+</button>
					</div>

					<div className={"w-full h-full overflow-y-scroll flex flex-col p-2"}>
						<div className={"flex flex-col p-2 border-b border-gray-300 font-medium"}>
							<p>Navn</p>
						</div>

						<AsyncDataRenderer
							loading={loading}
							error={error}
							data={data}

							renderData={events => events!.map(event => (
								<a key={event.id} href={`/admin/events/${event.id}`}
								   className={"items-center px-2 py-4 border-b border-gray-300"}>
									<p className={"font-medium"}>{event.name}</p>
								</a>
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