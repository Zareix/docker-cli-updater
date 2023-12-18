import chalk from "chalk-template";
import ora from "ora";
import { docker } from "../docker";
import { updateService } from "../service";

export const updateAll = async () => {
	const services = await docker.listServices();

	console.log(chalk`Found {blue ${services.length}} services`);
	for (const service of services) {
		const serviceName = service.Spec?.Name;
		const status = ora({
			text: chalk`Checking {yellow ${serviceName}}...`,
		});
		status.start();
		const serviceUpdated = await updateService(service.ID);
		switch (serviceUpdated.status) {
			case "updated":
				status.succeed(chalk`Service {yellow ${serviceName}} updated!`);
				break;
			case "failed":
				status.fail(chalk`Failed to update service {yellow ${serviceName}}`);
				break;
			case "up-to-date":
				status.info(chalk`Service {yellow ${serviceName}} is up to date`);
				break;
		}
	}
};
