"use client"
import {cn} from "tailwind-variants";
import card from "@/components/admin/Card";
import {IconEdit, IconPlus, IconTrash} from "@tabler/icons-react";
import {button, iconButton} from "@/components/admin/Button";
import textField from "@/components/admin/TextField";
import {getEvents} from "@/libs/API";
import useAsync from "@/hooks/useAsync";
import AsyncDataRenderer from "@/components/DataComponent";

export default function Page() {
	const {data: events, loading, error} = useAsync(async () => getEvents(), [])

	return (
		<div className={"mx-auto max-w-180 p-8 flex flex-col gap-4 h-screen"}>
			<h1 className={"text-2xl font-bold"}>Begivenheder</h1>

			<div className={"shrink-0 flex"}>
				<input type="search" className={textField()} placeholder={"søg efter begivenheder..."}/>

				<button className={cn(button(), "uppercase text-center flex items-center font-bold ml-auto")}>
					<IconPlus/> <p>Opret Event</p>
				</button>
			</div>

			<div className={cn(card(), "flex-1 overflow-hidden")}>
				<div className={"grid grid-cols-12 border-b border-slate-300 bg-slate-200 px-4 pt-2 pb-1"}>
					<p className={"col-span-5"}>Navn</p>
					<p className={"col-span-5"}>Dato</p>
					<p className={"col-span-2 ml-auto"}>Handliger</p>
				</div>

				<AsyncDataRenderer
					loading={loading} error={error} data={events}
					renderData={data =>
						data!.map((event) => (
							<div key={event.id} className={cn("grid grid-cols-12 gap-4 p-4 items-center")}>
								<a className={"font-semibold col-span-5 hover:underline"} href={`/admin/${event.id}`}>{event.title}</a>
								<p className={cn("font-light col-span-5")}>{event.date}</p>
								<div className={"col-span-2 ml-auto flex gap-2"}>
									<button className={cn(iconButton(), "p-1")}>
										<IconEdit/>
									</button>
									<button className={cn(iconButton(), "p-1 hover:bg-red-600 hover:border-red-700")}>
										<IconTrash/>
									</button>
								</div>
							</div>
						))
					}
				/>
			</div>
		</div>
	);
}