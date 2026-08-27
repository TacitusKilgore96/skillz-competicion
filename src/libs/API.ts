import db from "@/db.local.json"

async function simulateLoading() {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, Math.random() * 2000);
	});
}

export async function getEvents() {
	await simulateLoading();
	return Promise.resolve(db.events as EventModel[])
}