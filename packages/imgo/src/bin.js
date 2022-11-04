#!/usr/bin/env node

import { Command } from 'commander';
import { optimize } from './command/optimize.js';
import { loadConfig } from './helper/config.js';
import { logTable } from './helper/terminal.js';
import { join } from 'path';
import chalk from 'chalk';

const program = new Command();

// program.version(packageData.version);
program.name('imgo');
program.usage(chalk`{blue [command]} {green [options]}`);

program
	.command('optimize')
	.description(chalk.cyan('optimize images'))
	.option('-c, --config', 'config file location')
	.option('-o, --overwrite', 'overwrite already optimized images')
	.option('-p, --parallel', 'processes X amount in parallel')
	.action(async opts => {
		try {
			const config = await loadConfig(opts.config);
			const result = await optimize(config);
			const table = {
				Inputs: result.inputs.length,
				Outputs: result.outputs.length,
				Processed: result.processed,
			};

			if (result.errors.length > 0) {
				table.Errors = result.errors.length;
			}

			logTable(table);

			result.errors.forEach(error => {
				const input = join(error.data.file.local, error.data.file.base);
				const output = join(error.data.file.local, error.data.output);

				logTable({
					Input: chalk.dim.magenta(input),
					Output: chalk.dim.magenta(output),
					Error: chalk.red(error.message),
				});
			});

			console.log('');
		}
		catch (error) {
			console.error(error.message);
		}
		finally {
			process.exit(0);
		}
	});

program.parse(process.argv);
