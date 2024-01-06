import { confirm } from "@inquirer/prompts";
import { checkbox } from "@inquirer/prompts";
import chalk from "chalk-template";
import ora from "ora";
import { docker } from "../docker";
import { getNewerImage } from "../docker/image";
import { updateService } from "../docker/service";

export const list = async () => {
	const spinner = ora({
		text: chalk`{blue Loading services...}`,
	});
	spinner.start();
	const services = await Promise.all(
		(await docker.listServices()).map(async (c) => ({
			...c,
			newImage: await getNewerImage(c.Spec?.TaskTemplate?.ContainerSpec?.Image),
		})),
	);
	services.sort((a, b) => {
		if (a.newImage && !b.newImage) {
			return -1;
		}
		if (!a.newImage && b.newImage) {
			return 1;
		}
		return a.Spec?.Name?.localeCompare(b.Spec?.Name) ?? 0;
	});
	spinner.stop();

	if (services.length === 0) {
		console.log(chalk`{red No services running}`);
		return;
	}

	const servicesToUpdate = await checkbox({
		message: "Select a service to update",
		choices: services.map((c) => ({
			name: chalk`${c.Spec?.Name}{yellow ${
				c.newImage ? " (Update available)" : ""
			}}`,
			value: c,
			description: `Image: ${
				c.Spec?.TaskTemplate?.ContainerSpec?.Image.split("@")[0]
			}`,
		})),
		loop: false,
	});
	for (const service of servicesToUpdate) {
		const spinner = ora(
			chalk`Updating service {yellow ${service.Spec?.Name}}...`,
		);
		spinner.start();
		const serviceUpdated = await updateService(service.ID);
		switch (serviceUpdated.status) {
			case "updated":
				spinner.succeed(chalk`Service {yellow ${service.Spec?.Name}} updated`);
				break;
			case "failed":
				spinner.fail(
					chalk`Failed to update service {yellow ${service.Spec?.Name}}`,
				);
				break;
			case "up-to-date":
				spinner.info(
					chalk`Service {yellow ${service.Spec?.Name}} is up to date`,
				);
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
