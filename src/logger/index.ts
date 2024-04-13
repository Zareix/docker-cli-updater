import { discordLogger } from "./discord";
import { consoleLogger } from "./console";

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
	if (process.env.DISCORD_WEBHOOK_URL) {
		allLoggers.push(discordLogger);
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
