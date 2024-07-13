import { env } from "@/env";
import { consoleLogger } from "./console";
import { discordLogger } from "./discord";
import { diunTrackerLogger } from "./diun-tracker";

export type Logger = {
	allUpdated: (
		totalChecked: number,
		updatedServices: string[],
		failedUpdates: string[],
	) => Promise<void> | void;
	singleUpdated: (serviceName: string) => Promise<void> | void;
};

const logger = (): Logger => {
	const allLoggers: Logger[] = [];
	if (env.DISCORD_WEBHOOK_URL) {
		allLoggers.push(discordLogger);
	}
	if (env.DIUN_TRACKER_URL) {
		allLoggers.push(diunTrackerLogger);
	}
	allLoggers.push(consoleLogger);
	return {
		allUpdated: async (
			totalChecked: number,
			updatedServices: string[],
			failedUpdates: string[],
		) => {
			for (const logger of allLoggers) {
				await logger.allUpdated(totalChecked, updatedServices, failedUpdates);
			}
		},
		singleUpdated: async (serviceName: string) => {
			for (const logger of allLoggers) {
				await logger.singleUpdated(serviceName);
			}
		},
	};
};

export { logger };
