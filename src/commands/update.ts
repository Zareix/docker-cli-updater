import chalk from "chalk-template";
import ora from "ora";
import { dockerProvider } from "../docker";
import { logger } from "../logger";

const update = async (serviceName: string, serviceId: string) => {
	const status = ora({
		text: chalk`Updating {yellow ${serviceName}}...`,
	});
	status.start();
	const serviceUpdated = await dockerProvider.updateContainer(serviceId);
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

	const services = (await dockerProvider.listContainers()).sort(
		(a, b) => a.name.localeCompare(b.name) ?? 0,
	);

	console.log(chalk`Found {blue ${services.length}} services`);
	for (const service of services) {
		const serviceName = service.name;
		if (!serviceName) {
			console.log(chalk`{red Service has no name}`);
			continue;
		}
		const res = await update(serviceName, service.id);
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
		await logger().allUpdated(services.length, updatedServices, failedUpdates);

	process.exit(0);
};

export const updateSingle = async (
	serviceName: string,
	options: UpdateOptions,
) => {
	const serviceId = (await dockerProvider.listContainers()).find(
		(s) => s.name === serviceName,
	)?.id;
	if (!serviceId) {
		console.log(chalk`{red Service {yellow ${serviceName}} not found} `);
		return;
	}
	await update(serviceName, serviceId);

	if (!options.silent) await logger().singleUpdated(serviceName);
	process.exit(0);
};
