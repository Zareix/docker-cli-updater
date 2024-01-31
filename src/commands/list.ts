import { confirm } from "@inquirer/prompts";
import { checkbox } from "@inquirer/prompts";
import chalk from "chalk-template";
import ora from "ora";
import { dockerProvider } from "../docker";

export const list = async () => {
	const spinner = ora({
		text: chalk`{blue Loading running containers...}`,
	});
	spinner.start();

	const containers = await Promise.all(
		(await dockerProvider.listContainers()).map(async (c) => ({
			...c,
			newImage: await dockerProvider.getNewerImage(c.image),
		})),
	);
	containers.sort((a, b) => {
		if (a.newImage && !b.newImage) {
			return -1;
		}
		if (!a.newImage && b.newImage) {
			return 1;
		}
		return a.name?.localeCompare(b.name ?? "") ?? 0;
	});
	spinner.stop();

	if (containers.length === 0) {
		console.log(chalk`{red No container running}`);
		process.exit(0);
	}

	const containersToUpdate = await checkbox({
		message: "Select a container to update",
		choices: containers.map((c) => ({
			name: chalk`${c.name}{yellow ${c.newImage ? " (Update available)" : ""}}`,
			value: c,
		})),
		loop: false,
	});
	if (containersToUpdate.length === 0) {
		console.log(chalk`{red No container selected}`);
		process.exit(0);
	}
	for (const container of containersToUpdate) {
		const spinner = ora(
			chalk`Updating container {yellow ${container.name}}...`,
		);
		spinner.start();
		const containerUpdated = await dockerProvider.updateContainer(container.id);
		switch (containerUpdated.status) {
			case "updated":
				spinner.succeed(chalk`Container {yellow ${container.name}} updated`);
				break;
			case "failed":
				spinner.fail(
					chalk`Failed to update container {yellow ${container.name}}`,
				);
				break;
			case "up-to-date":
				spinner.info(chalk`Container {yellow ${container.name}} is up to date`);
				break;
		}
	}

	if (
		await confirm({
			message: "Update another container ?",
		})
	) {
		await list();
	}
	process.exit(0);
};
