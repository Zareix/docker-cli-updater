import { Command } from "@commander-js/extra-typings";
import chalk from "chalk";
import { list } from "./commands/list";
import { root } from "./commands/root";
import { updateAll, updateSingle } from "./commands/update";

const program = new Command();

program
	.name("docker-cli-updater")
	.description(
		"CLI to update containers/containers in a docker and docker-swarm",
	)
	.version("0.2.0")
	.action(root);

program
	.command("update")
	.description("Update containers")
	.option("-a, --all", "Update all containers/containers")
	.option("-s, --silent", "Silent mode (don't use any logger)")
	.argument("[container_name]", "Name of container/container to update")
	.action(async (containerName, options) => {
		if (options.all) {
			if (containerName) {
				console.log("Ignoring container name");
			}
			await updateAll(options);
			return;
		}
		if (containerName) {
			await updateSingle(containerName, options);
			return;
		}
		if (!options.all && !containerName) {
			console.log(chalk.red("No container name specified"));
		}
	});

program
	.command("list")
	.alias("ls")
	.description(
		"Select a container in a list of all containers running to update it",
	)
	.action(list);

await program.parseAsync();
