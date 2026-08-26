import db from "@/db.local.json";

export async function getEvents() {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return db.events as EventModel[];
}

export async function getEventById(id: number) {
	return db.events.find((event) => event.id === id) as EventModel | undefined;
}