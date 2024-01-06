import * as discord from "./discord";

type Logger = {
	allUpdated: (
		updatedServices: string[],
		failedUpdates: string[],
	) => Promise<void> | void;
	singleUpdated: (serviceName: string) => Promise<void> | void;
};

const logger = (): Logger => {
	if (process.env.DISCORD_WEBHOOK_URL) {
		return discord;
	}
	return {
		allUpdated: (updatedServices: string[], failedUpdates: string[]) => {
			console.log(
				`Updated services: ${updatedServices.join(", ")}`,
				`Failed to update services: ${failedUpdates.join(", ")}`,
			);
		},
		singleUpdated: (serviceName: string) => {
			console.log(`Updated service: ${serviceName}`);
		},
	};
};

export { logger };
