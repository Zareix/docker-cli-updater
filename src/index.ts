import { Command } from "commander";
import { list } from "./commands/list";
import { updateAll } from "./commands/updateAll";

const program = new Command();

program
	.command("update")
	.description("Update all running services")
	.action(updateAll);

program
	.command("list")
	.description(
		"Select a service in a list of all services running to update it",
	)
	.alias("ls")
	.action(list);

program.parse();
