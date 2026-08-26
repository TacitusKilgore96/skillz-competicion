"use client"

import {AdminShell} from "@/app/admin/shell";
import {cn} from "tailwind-variants";
import card from "@/components/admin/Card";
import textField from "@/components/admin/TextField";
import {button, iconButton} from "@/components/admin/Button";
import useAsync from "@/hooks/useAsync";
import {getEvents} from "@/libs/API";
import AsyncDataRenderer from "@/components/DataComponent";
import { IconEdit } from '@tabler/icons-react';

export default function Page() {
	const {data, loading, error, execute} = useAsync<EventModel[]>(async () => getEvents(), []);

	return (
		<AdminShell pageTitle={"Begivenheder"} currentPath={"/admin/events"}>
			<div className={"p-8 h-full flex flex-col items-center gap-4 mx-auto max-w-300"}>
				<div className={"w-full flex justify-between"}>
					<input className={textField()} placeholder={"Søg..."}/>

					<button className={cn(button(), "uppercase font-semibold")}>+ Opret event</button>
				</div>

				<div className={cn(
					card(),
					"w-full h-full overflow-y-scroll flex flex-col p-2"
				)}>
					<div
						className={"grid grid-cols-[1.25fr_1fr_1fr_.25fr] p-2 border-b border-gray-300 font-medium items-center"}>
						<p>Navn</p>
						<p>Dato</p>
						<p>Status</p>
						<p className={"text-right"}>Handlinger</p>
					</div>

					<AsyncDataRenderer
						loading={loading}
						error={error}
						data={data}

						renderData={events => events!.map(event => (
							<div key={event.id}
							     className={"grid grid-cols-[1.25fr_1fr_1fr_.25fr] items-center p-2 border-b border-gray-300"}>
								<p className={"font-medium"}>{event.name}</p>
								<p className={"text-gray-600"}>{event.date}</p>
								<p className={"text-gray-600"}>{event.status}</p>
								<div className={"ml-auto"}>
									<button className={iconButton()}>
										<IconEdit/>
									</button>
								</div>
							</div>
						))}
					/>
				</div>
			</div>
		</AdminShell>
	)
}