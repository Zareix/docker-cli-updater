import chalk from "chalk-template";
import ora from "ora";
import { docker } from "../docker";
import { updateService } from "../docker/service";
import { logger } from "../logger";

const update = async (serviceName: string, serviceId: string) => {
	const status = ora({
		text: chalk`Checking {yellow ${serviceName}}...`,
	});
	status.start();
	const serviceUpdated = await updateService(serviceId);
	switch (serviceUpdated.status) {
		case "updated":
			status.succeed(chalk`Service {yellow ${serviceName}} updated!`);
			return serviceUpdated;
		case "failed":
			status.fail(chalk`Failed to update service {yellow ${serviceName}}`);
			return serviceUpdated;
		case "up-to-date":
			status.info(chalk`Service {yellow ${serviceName}} is up to date`);
			return serviceUpdated;
	}
};

type UpdateOptions = {
	silent?: boolean;
};

export const updateAll = async (options: UpdateOptions) => {
	const updatedServices = [];
	const failedUpdates = [];

	const services = (await docker.listServices()).sort(
		(a, b) => a.Spec?.Name?.localeCompare(b.Spec?.Name) ?? 0,
	);

	console.log(chalk`Found {blue ${services.length}} services`);
	for (const service of services) {
		const serviceName = service.Spec?.Name;
		if (!serviceName) {
			console.log(chalk`{red Service has no name}`);
			continue;
		}
		const res = await update(serviceName, service.ID);
		switch (res.status) {
			case "updated":
				updatedServices.push(serviceName);
				break;
			case "failed":
				failedUpdates.push(serviceName);
				break;
			default:
				break;
		}
	}

	if (!options.silent)
		await logger().allUpdated(updatedServices, failedUpdates);
};

export const updateSingle = async (
	serviceName: string,
	options: UpdateOptions,
) => {
	const serviceId = (await docker.listServices()).find(
		(s) => s.Spec?.Name === serviceName,
	)?.ID;
	if (!serviceId) {
		console.log(chalk`{red Service {yellow ${serviceName}} not found} `);
		return;
	}
	await update(serviceName, serviceId);

	if (!options.silent) await logger().singleUpdated(serviceName);
};
