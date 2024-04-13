import { confirm } from "@inquirer/prompts";
import { checkbox } from "@inquirer/prompts";
import chalk from "chalk-template";
import ora from "ora";
import { dockerProvider } from "../docker";

type RootOptions = {
	skipCheck: boolean;
};

export const root = async (options: RootOptions) => {
	if (options.skipCheck) {
		console.log(chalk`{yellow Skipping check of new version}`);
	}

	let spinner = ora({
		text: chalk`{blue Loading running containers...}`,
	});
	spinner.start();

	const containers = await Promise.all(
		(await dockerProvider.listContainers()).map(async (c) => ({
			...c,
			newImage: options.skipCheck
				? null
				: await dockerProvider.getNewerImage(c.image),
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

	spinner = ora(chalk`Updating containers...`);
	spinner.start();
	const updateStatus = await dockerProvider.updateContainers(
		containersToUpdate.map((c) => c.id),
	);
	switch (updateStatus.status) {
		case "done":
			spinner.succeed(
				chalk`{green ${updateStatus.updated}} container(s) updated and {red ${updateStatus.failed}} failed for {blue ${updateStatus.scanned}} scanned`,
			);
			break;
		case "failed":
			spinner.fail(
				chalk`{red Could not update containers: ${updateStatus.reason}}`,
			);
			break;
	}

	if (
		await confirm({
			message: "Update another container ?",
		})
	) {
		await root(options);
	}
	process.exit(0);
};
