import type { Logger } from "@/logger";

const allUpdated = async (
	_totalChecked: number,
	updatedServices: string[],
	_failedUpdates: string[],
) => {
	if (!process.env.DIUN_TRACKER_URL) {
		return;
	}
	await fetch(`${process.env.DIUN_TRACKER_URL}/api/updates`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ containerNames: updatedServices }),
	});
};

const singleUpdated = async (serviceName: string) => {
	if (!process.env.DIUN_TRACKER_URL) {
		return;
	}
	await fetch(`${process.env.DIUN_TRACKER_URL}/api/updates`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ containerNames: [serviceName] }),
	});
};

export const diunTrackerLogger = { allUpdated, singleUpdated } satisfies Logger;
