import type { Logger } from "@/logger";
import chalk from "chalk-template";

const allUpdated = (
	totalChecked: number,
	updatedServices: string[],
	failedUpdates: string[],
) => {
	console.log(chalk`Checked {blue ${totalChecked}} services`);
	console.log(
		updatedServices.length > 0
			? `Updated services: ${updatedServices.join(", ")}`
			: "No container updated",
	);
	console.log(
		failedUpdates.length > 0
			? `Failed to update services: ${failedUpdates.join(", ")}`
			: "No failed updates",
	);
};

const singleUpdated = (serviceName: string) => {
	// console.log(`Updated service: ${serviceName}`);
};

export const consoleLogger = {
	allUpdated,
	singleUpdated,
} satisfies Logger;
