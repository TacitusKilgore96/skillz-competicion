import { EventEmitter } from "events";

class LiveEventBus extends EventEmitter {
	constructor() {
		super();
		this.setMaxListeners(200);
	}
}

const globalForLive = globalThis as unknown as { liveEventBus?: LiveEventBus };
export const liveEventBus = globalForLive.liveEventBus || new LiveEventBus();
globalForLive.liveEventBus = liveEventBus;

export function broadcastUpdate(type: "times" | "event" | "teams" | "reload", payload?: unknown) {
	try {
		liveEventBus.emit("broadcast", {
			type,
			payload,
			timestamp: Date.now(),
		});
	} catch (e) {
		console.error("Error broadcasting update:", e);
	}
}
