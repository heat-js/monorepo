
import { Command } from 'commander'
import { spawn } from './index';

const program = new Command();

program.name('compiler');

program
	.command('run')
	.argument('<file>', 'file to execute')
	.description('execute a file')
	.option('-e, --env <variables...>', 'space separated environment variables')
	.option('--include-packages', 'include all packages inside the build process')
	.action(async (input, options) => {
		const node = await spawn(input, options);
		node.stdout.pipe(process.stdout);
		node.stderr.pipe(process.stderr);
	});

// program
// 	.command('bundle')
// 	.argument('<file>', 'file to bundle')
// 	.description('execute a coffeescript file')
// 	.option('--include-packages', 'include all packages inside the build process')
// 	.action(async (input, options) => {
// 		const node = await bundle(input, options);
// 		node.stdout.pipe(process.stdout);
// 		node.stderr.pipe(process.stderr);
// 	});

program.parse(process.argv);
