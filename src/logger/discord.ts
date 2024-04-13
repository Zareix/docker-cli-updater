const getCheckedText = (totalChecked: number) =>
	totalChecked > 0 ? `Checked ${totalChecked} services` : "No services checked";

const getUpdatedText = (updatedServices: string[]) =>
	updatedServices.length > 0
		? `Updated services: ${updatedServices.join(", ")}`
		: "No container updated";

const getFailedText = (failedUpdates: string[]) =>
	failedUpdates.length > 0
		? `Failed to update services: ${failedUpdates.join(", ")}`
		: "All services updated";

const allUpdated = async (
	totalChecked: number,
	updatedServices: string[],
	failedUpdates: string[],
) => {
	if (!process.env.DISCORD_WEBHOOK_URL) {
		return;
	}
	await fetch(process.env.DISCORD_WEBHOOK_URL, {
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
	if (!process.env.DISCORD_WEBHOOK_URL) {
		return;
	}
	await fetch(process.env.DISCORD_WEBHOOK_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			content: `Updated service: ${serviceName}`,
		}),
	});
};

export { allUpdated, singleUpdated };
