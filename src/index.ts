import { Command } from 'commander';
import { list } from './commands/list';
import { updateAll } from './commands/updateAll';

const program = new Command();

program.command('update').action(updateAll);

program.command('list').action(list);

program.parse();
