import { Command } from "@commander-js/extra-typings";
import chalk from "chalk";
import { list } from "./commands/list";
import { root } from "./commands/root";
import { updateAll, updateSingle } from "./commands/update";
import { chooseDockerEnv } from "@/env";

const program = new Command();

program
	.name("docker-cli-updater")
	.description("CLI to update container in a docker and docker-swarm")
	.version("0.3.0")
	.option("-s, --skip-check", "Skip check of new version", false)
	.action(root);

program
	.command("update")
	.description("Update containers")
	.option("-a, --all", "Update all containers")
	.option("-s, --silent", "Silent mode (don't use any logger)")
	.option("--host <host>", "Docker host to use")
	.argument("[container_name...]", "Name of container(s) to update")
	.action(async (containersName, options) => {
		await chooseDockerEnv(options.host);
		if (options.all) {
			if (containersName) {
				console.log("Ignoring container name");
			}
			await updateAll(options);
			process.exit(0);
		}
		if (containersName && containersName.length > 0) {
			console.log(
				chalk.yellow(
					`Updating following containers: ${containersName.join(", ")}`,
				),
			);
			for (const containerName of containersName) {
				await updateSingle(containerName, options);
			}
			process.exit(0);
		}
		if (!options.all && (!containersName || containersName.length === 0)) {
			console.log(chalk.red("No container name specified"));
		}
	});

program
	.command("list")
	.alias("ls")
	.description("List containers that have an update available")
	.action(list);

await program.parseAsync();
