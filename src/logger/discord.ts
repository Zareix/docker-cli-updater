const allUpdated = async (
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
			content: `Updated services: ${updatedServices.join(
				", ",
			)}\nFailed to update services: ${failedUpdates.join(", ")}`,
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
