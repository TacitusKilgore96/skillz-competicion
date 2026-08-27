"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "admin_selected_event_id";
const EVENT_CHANGE_TYPE = "admin_selected_event_change";

function getSnapshot(): number | null {
	if (typeof window === "undefined") return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored !== null && stored !== "" && stored !== "all") {
		const parsed = parseInt(stored, 10);
		return isNaN(parsed) ? null : parsed;
	}
	return null;
}

function getServerSnapshot(): number | null {
	return null;
}

function subscribe(callback: () => void): () => void {
	if (typeof window === "undefined") return () => {};

	window.addEventListener(EVENT_CHANGE_TYPE, callback);
	window.addEventListener("storage", callback);

	return () => {
		window.removeEventListener(EVENT_CHANGE_TYPE, callback);
		window.removeEventListener("storage", callback);
	};
}

export function useSelectedEvent() {
	const selectedEventId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	const setSelectedEventId = useCallback((id: number | null) => {
		if (typeof window !== "undefined") {
			if (id === null) {
				localStorage.setItem(STORAGE_KEY, "all");
			} else {
				localStorage.setItem(STORAGE_KEY, String(id));
			}
			window.dispatchEvent(new CustomEvent(EVENT_CHANGE_TYPE, { detail: id }));
		}
	}, []);

	return {
		selectedEventId,
		setSelectedEventId,
	};
}
