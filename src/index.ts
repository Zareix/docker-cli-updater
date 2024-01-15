import { Command } from "@commander-js/extra-typings";
import chalk from "chalk";
import { list } from "./commands/list";
import { updateAll, updateSingle } from "./commands/update";

const program = new Command();

program
	.name("docker-cli-updater")
	.description("CLI to update containers/services in a docker and docker-swarm")
	.version("0.1.0");

program
	.command("update")
	.description("Update services")
	.option("-a, --all", "Update all containers/services")
	.option("-s, --silent", "Silent mode (don't use any logger)")
	.argument("[container_name]", "Name of container/service to update")
	.action(async (serviceName, options) => {
		if (options.all) {
			if (serviceName) {
				console.log("Ignoring service name");
			}
			await updateAll(options);
			return;
		}
		if (serviceName) {
			await updateSingle(serviceName, options);
			return;
		}
		if (!options.all && !serviceName) {
			console.log(chalk.red("No service name specified"));
		}
	});

program
	.command("list")
	.alias("ls")
	.description(
		"Select a service in a list of all services running to update it",
	)
	.action(list);

await program.parseAsync();
