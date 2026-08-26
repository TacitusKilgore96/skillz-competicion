import db from "@/db.local.json";

export function getEvents() {
	return db.events as Event[];
}

export function getEventById(id: number) {
	return db.events.find((event) => event.id === id) as Event | undefined;
}