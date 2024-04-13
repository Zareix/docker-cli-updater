import type { Logger } from "@/logger";

const allUpdated = (
	totalChecked: number,
	updatedServices: string[],
	failedUpdates: string[],
) => {
	console.log(
		`Checked ${totalChecked} services`,
		`Updated services: ${updatedServices.join(", ")}`,
		`Failed to update services: ${failedUpdates.join(", ")}`,
	);
};

const singleUpdated = (serviceName: string) => {
	console.log(`Updated service: ${serviceName}`);
};

export const consoleLogger = {
	allUpdated,
	singleUpdated,
} satisfies Logger;
