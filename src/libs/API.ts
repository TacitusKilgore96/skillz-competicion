import db from "@/db.local.json"
import {EventModel} from "@/models/EventModel";

async function simulateLoading() {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, Math.random() * 2000);
	});
}

export async function getEvents(): Promise<EventModel[]> {
	await simulateLoading();
	return Promise.resolve(db.events as EventModel[])
}