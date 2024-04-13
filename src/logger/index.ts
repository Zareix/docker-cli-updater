import * as discord from "./discord";

type Logger = {
	allUpdated: (
		totalChecked: number,
		updatedServices: string[],
		failedUpdates: string[],
	) => Promise<void> | void;
	singleUpdated: (serviceName: string) => Promise<void> | void;
};

const consoleLogger: Logger = {
	allUpdated: (
		totalChecked: number,
		updatedServices: string[],
		failedUpdates: string[],
	) => {
		console.log(
			`Checked ${totalChecked} services`,
			`Updated services: ${updatedServices.join(", ")}`,
			`Failed to update services: ${failedUpdates.join(", ")}`,
		);
	},
	singleUpdated: (serviceName: string) => {
		console.log(`Updated service: ${serviceName}`);
	},
};

const logger = (): Logger => {
	const allLoggers: Logger[] = [];
	if (process.env.DISCORD_WEBHOOK_URL) {
		allLoggers.push(discord);
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
