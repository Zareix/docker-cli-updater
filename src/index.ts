import { Command } from "commander";
import { list } from "./commands/list";
import { updateAll } from "./commands/updateAll";

const program = new Command();

program
	.name("docker-swarm-updater")
	.description("CLI to update services in a docker swarm cluster")
	.version("0.1.0");

program.command("update").description("Update all services").action(updateAll);

program
	.command("list")
	.description(
		"Select a service in a list of all services running to update it",
	)
	.alias("ls")
	.action(list);

program.parseAsync();
