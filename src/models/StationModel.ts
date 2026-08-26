interface StationEntryModel {
	teamId: number;
	time: string;
}

interface StationModel {
	id: number;
	name: string;
	eventId: number;
	entries?: StationEntryModel[];
}
