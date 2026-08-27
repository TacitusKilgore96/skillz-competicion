import { TeamModel } from "@/models/TeamModel";
import { ClassModel } from "@/models/ClassModel";
import { StationModel, StationTimeModel } from "@/models/StationModel";
import { EventModel } from "@/models/EventModel";

export interface TeamStanding {
	id: number;
	rank: number;
	previousRank?: number;
	rankChange?: number; // >0 moved up, <0 moved down, 0 unchanged
	teamName: string;
	className: string;
	schoolName: string;
	completedStations: number;
	totalStations: number;
	totalSeconds: number;
	formattedTotalTime: string;
	averageSeconds: number;
	formattedAverageTime: string;
	basePoints: number;
	placementPoints: number;
	speedPoints: number;
	totalPoints: number;
	stationBreakdown: {
		stationId: number;
		stationName: string;
		seconds: number;
		formattedTime: string;
		stationRank: number;
		stationPoints: number;
	}[];
}

export function formatTimeMMSS(totalSeconds: number): string {
	if (isNaN(totalSeconds) || totalSeconds < 0) return "--:--";
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function calculateLeaderboard(
	teams: TeamModel[],
	classes: ClassModel[],
	stations: StationModel[],
	stationTimes: StationTimeModel[],
	previousStandings?: Map<number, number> // teamId -> previous rank
): TeamStanding[] {
	const classMap = new Map<number, ClassModel>();
	for (const cls of classes) {
		classMap.set(cls.id, cls);
	}

	const stationMap = new Map<number, StationModel>();
	for (const st of stations) {
		stationMap.set(st.id, st);
	}

	// 1. Group station times by stationId to calculate station-level rankings
	const timesByStation = new Map<number, StationTimeModel[]>();
	for (const st of stations) {
		timesByStation.set(st.id, []);
	}
	for (const time of stationTimes) {
		const list = timesByStation.get(time.stationId) || [];
		list.push(time);
		timesByStation.set(time.stationId, list);
	}

	// Calculate per-station placements (teamId -> { stationRank, stationPoints })
	const stationPlacementBonus: Record<number, number> = {
		1: 500,
		2: 350,
		3: 250,
		4: 150,
		5: 100,
	};
	const defaultPlacementBonus = 50;

	const teamStationRankMap = new Map<
		string,
		{ stationRank: number; stationPoints: number }
	>(); // key: `${teamId}-${stationId}`

	for (const [stationId, times] of timesByStation.entries()) {
		// Sort times ascending (fastest first)
		const sortedTimes = [...times].sort((a, b) => a.timeSeconds - b.timeSeconds);
		sortedTimes.forEach((item, index) => {
			const stationRank = index + 1;
			const stationPoints = stationPlacementBonus[stationRank] ?? defaultPlacementBonus;
			teamStationRankMap.set(`${item.teamId}-${stationId}`, {
				stationRank,
				stationPoints,
			});
		});
	}

	// 2. Build standings for each team
	const standingsRaw = teams.map((team) => {
		const cls = classMap.get(team.classId);
		const teamTimes = stationTimes.filter((st) => st.teamId === team.id);

		let totalSeconds = 0;
		let placementPoints = 0;
		const stationBreakdown: TeamStanding["stationBreakdown"] = [];

		for (const t of teamTimes) {
			totalSeconds += t.timeSeconds;
			const st = stationMap.get(t.stationId);
			const placementInfo = teamStationRankMap.get(`${team.id}-${t.stationId}`) || {
				stationRank: 1,
				stationPoints: defaultPlacementBonus,
			};
			placementPoints += placementInfo.stationPoints;

			stationBreakdown.push({
				stationId: t.stationId,
				stationName: st ? st.name : `Post #${t.stationId}`,
				seconds: t.timeSeconds,
				formattedTime: formatTimeMMSS(t.timeSeconds),
				stationRank: placementInfo.stationRank,
				stationPoints: placementInfo.stationPoints,
			});
		}

		const completedStations = teamTimes.length;
		const totalStations = stations.length;

		// Points system:
		// Base: 1000 points per completed station
		const basePoints = completedStations * 1000;

		// Speed bonus based on time efficiency
		// Faster overall total time grants bonus speed points
		const speedPoints =
			completedStations > 0
				? Math.max(0, completedStations * 200 - Math.floor(totalSeconds / 10))
				: 0;

		const totalPoints = basePoints + placementPoints + speedPoints;
		const averageSeconds =
			completedStations > 0 ? Math.round(totalSeconds / completedStations) : 0;

		return {
			id: team.id,
			rank: 0,
			teamName: team.name,
			className: cls ? cls.name : "Ukendt klasse",
			schoolName: cls ? cls.school : "",
			completedStations,
			totalStations,
			totalSeconds,
			formattedTotalTime: formatTimeMMSS(totalSeconds),
			averageSeconds,
			formattedAverageTime: formatTimeMMSS(averageSeconds),
			basePoints,
			placementPoints,
			speedPoints,
			totalPoints,
			stationBreakdown,
		};
	});

	// 3. Sort standings:
	// - Higher totalPoints first
	// - If equal points, more completedStations first
	// - If equal completedStations, lower totalSeconds first
	standingsRaw.sort((a, b) => {
		if (b.totalPoints !== a.totalPoints) {
			return b.totalPoints - a.totalPoints;
		}
		if (b.completedStations !== a.completedStations) {
			return b.completedStations - a.completedStations;
		}
		return a.totalSeconds - b.totalSeconds;
	});

	// 4. Assign ranks and compute rankChange compared to previousStandings
	return standingsRaw.map((standing, index) => {
		const currentRank = index + 1;
		let prevRank = currentRank;
		let rankChange = 0;

		if (previousStandings && previousStandings.has(standing.id)) {
			prevRank = previousStandings.get(standing.id)!;
			rankChange = prevRank - currentRank; // e.g. prev=4, curr=2 => +2 (moved up 2 places)
		}

		return {
			...standing,
			rank: currentRank,
			previousRank: prevRank,
			rankChange,
		};
	});
}

export type EventPhase =
	| "INACTIVE" // No active event / event status is CREATED
	| "RUNNING_LIVE" // Active event, runtime counting down, leaderboard visible
	| "RUNNING_SUSPENSE" // Active event, <= blackoutMinutes left, leaderboard hidden for suspense
	| "TIME_OVER_PENDING" // Active event runtime has reached 0, but waiting for organizer confirmation
	| "FINAL_RESULTS"; // Organizer confirmed event is finished / final podium results revealed

export interface EventTimingState {
	phase: EventPhase;
	totalDurationSeconds: number;
	elapsedSeconds: number;
	remainingSeconds: number;
	formattedRemaining: string;
	isBlackout: boolean;
	isFinished: boolean;
}

export function computeEventTiming(event: EventModel | null): EventTimingState {
	if (!event) {
		return {
			phase: "INACTIVE",
			totalDurationSeconds: 0,
			elapsedSeconds: 0,
			remainingSeconds: 0,
			formattedRemaining: "00:00",
			isBlackout: false,
			isFinished: false,
		};
	}

	// If organizer has confirmed over or status is explicitly FINISHED:
	if (event.isConfirmedOver || event.status === "FINISHED") {
		return {
			phase: "FINAL_RESULTS",
			totalDurationSeconds: (event.durationMinutes || 120) * 60,
			elapsedSeconds: (event.durationMinutes || 120) * 60,
			remainingSeconds: 0,
			formattedRemaining: "00:00",
			isBlackout: false,
			isFinished: true,
		};
	}

	// If event has not been started yet:
	if (event.status !== "RUNNING" || !event.startedAt) {
		return {
			phase: "INACTIVE",
			totalDurationSeconds: (event.durationMinutes || 120) * 60,
			elapsedSeconds: 0,
			remainingSeconds: (event.durationMinutes || 120) * 60,
			formattedRemaining: formatTimeMMSS((event.durationMinutes || 120) * 60),
			isBlackout: false,
			isFinished: false,
		};
	}

	// Event is RUNNING:
	const startMs = new Date(event.startedAt).getTime();
	const nowMs = Date.now();
	const elapsedSeconds = Math.max(0, Math.floor((nowMs - startMs) / 1000));
	const totalDurationSeconds = (event.durationMinutes || 120) * 60;
	const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
	const blackoutThresholdSeconds = (event.blackoutMinutes !== undefined ? event.blackoutMinutes : 30) * 60;

	if (remainingSeconds === 0) {
		return {
			phase: "TIME_OVER_PENDING",
			totalDurationSeconds,
			elapsedSeconds,
			remainingSeconds: 0,
			formattedRemaining: "00:00",
			isBlackout: true,
			isFinished: false,
		};
	}

	if (remainingSeconds <= blackoutThresholdSeconds) {
		return {
			phase: "RUNNING_SUSPENSE",
			totalDurationSeconds,
			elapsedSeconds,
			remainingSeconds,
			formattedRemaining: formatTimeMMSS(remainingSeconds),
			isBlackout: true,
			isFinished: false,
		};
	}

	return {
		phase: "RUNNING_LIVE",
		totalDurationSeconds,
		elapsedSeconds,
		remainingSeconds,
		formattedRemaining: formatTimeMMSS(remainingSeconds),
		isBlackout: false,
		isFinished: false,
	};
}
