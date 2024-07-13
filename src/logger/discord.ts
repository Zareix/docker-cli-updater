import { env } from "@/env";
import type { Logger } from "@/logger";

const getCheckedText = (totalChecked: number) =>
	totalChecked > 0 ? `Checked ${totalChecked} services` : "No services checked";

const getUpdatedText = (updatedServices: string[]) =>
	updatedServices.length > 0
		? `Updated services: ${updatedServices.join(", ")}`
		: "No container updated";

const getFailedText = (failedUpdates: string[]) =>
	failedUpdates.length > 0
		? `Failed to update services: ${failedUpdates.join(", ")}`
		: "No failed updates";

const allUpdated = async (
	totalChecked: number,
	updatedServices: string[],
	failedUpdates: string[],
) => {
	if (!env.DISCORD_WEBHOOK_URL) {
		return;
	}
	await fetch(env.DISCORD_WEBHOOK_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			content: `${getCheckedText(totalChecked)}\n${getUpdatedText(
				updatedServices,
			)}\n${getFailedText(failedUpdates)}`,
		}),
	});
};

const singleUpdated = async (serviceName: string) => {
	if (!env.DISCORD_WEBHOOK_URL) {
		return;
	}
	await fetch(env.DISCORD_WEBHOOK_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			content: `Updated service: ${serviceName}`,
		}),
	});
};

export const discordLogger = { allUpdated, singleUpdated } satisfies Logger;
