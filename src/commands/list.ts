import { confirm } from "@inquirer/prompts";
import { checkbox } from "@inquirer/prompts";
import chalk from "chalk-template";
import ora from "ora";
import { dockerProvider } from "../docker";

export const list = async () => {
	const spinner = ora({
		text: chalk`{blue Loading services...}`,
	});
	spinner.start();
	const services = await Promise.all(
		(await dockerProvider.listContainers()).map(async (c) => ({
			...c,
			newImage: await dockerProvider.getNewerImage({
				tag: c.image.tag,
				digest: c.image.digest,
			}),
		})),
	);
	services.sort((a, b) => {
		if (a.newImage && !b.newImage) {
			return -1;
		}
		if (!a.newImage && b.newImage) {
			return 1;
		}
		return a.name?.localeCompare(b.name ?? "") ?? 0;
	});
	spinner.stop();

	if (services.length === 0) {
		console.log(chalk`{red No services running}`);
		return;
	}

	const servicesToUpdate = await checkbox({
		message: "Select a service to update",
		choices: services.map((c) => ({
			name: chalk`${c.name}{yellow ${c.newImage ? " (Update available)" : ""}}`,
			value: c,
			description: `Image: ${c.image.tag}`,
		})),
		loop: false,
	});
	if (servicesToUpdate.length === 0) {
		console.log(chalk`{red No service selected}`);
		return;
	}
	for (const service of servicesToUpdate) {
		const spinner = ora(chalk`Updating service {yellow ${service.name}}...`);
		spinner.start();
		const serviceUpdated = await dockerProvider.updateContainer(service.id);
		switch (serviceUpdated.status) {
			case "updated":
				spinner.succeed(chalk`Service {yellow ${service.name}} updated`);
				break;
			case "failed":
				spinner.fail(chalk`Failed to update service {yellow ${service.name}}`);
				break;
			case "up-to-date":
				spinner.info(chalk`Service {yellow ${service.name}} is up to date`);
				break;
		}
	}

	const updateAnother = await confirm({
		message: "Update another service ?",
	});
	if (updateAnother) {
		await list();
	}
};
