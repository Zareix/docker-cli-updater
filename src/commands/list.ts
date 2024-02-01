import chalk from "chalk-template";
import ora from "ora";
import { dockerProvider } from "../docker";

export const list = async () => {
	const spinner = ora({
		text: chalk`{blue Loading running containers...}`,
	});
	spinner.start();

	const containers = (
		await Promise.all(
			(
				await dockerProvider.listContainers()
			).map(async (c) => ({
				...c,
				newImage: await dockerProvider.getNewerImage(c.image),
			})),
		)
	).filter((c) => c.newImage);
	containers.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? 0);
	spinner.stop();

	if (containers.length === 0) {
		console.log(chalk`{red No running container needs update}`);
		process.exit(0);
	}

	console.log("Containers with update available:");
	console.log(
		containers
			.map((c) => chalk`{yellow ${c.name}} (${c.image.tag})`)
			.join("\n"),
	);

	process.exit(0);
};
