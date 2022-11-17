
import { Command } from 'commander'
import { spawn } from './index'
import { test } from './test'

const program = new Command()

program.name('code')

program
	.command('run')
	.argument('<file>', 'file to execute')
	.description('execute a file')
	.option('-e, --env <variables...>', 'space separated environment variables')
	.option('--include-packages', 'include all packages inside the build process')
	.action(async (input, options) => {
		const node = await spawn(input, options)
		node.stdout.pipe(process.stdout)
		node.stderr.pipe(process.stderr)
	})

program
	.command('test')
	.argument('[filters...]', 'filters of the test files to run')
	.description('test project')
	.action(async (filters) => {
		await test(filters)
	})

program.parse(process.argv)
