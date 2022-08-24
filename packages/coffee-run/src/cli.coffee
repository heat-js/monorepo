
import { Command } 		from 'commander'
import spawn 			from './spawn'

program = new Command
program.name 'coffee-run'

program
	.command 'run'
	.argument('<file>',					'file to execute')
	.description						'execute a coffeescript file'
	.option '-e, --env <variables...>',	'space separated environment variables'
	.option '--include-packages',		'include all packages inside the build process'
	# .option '--commonjs',				'transform everything to commonjs'
	.action (input, options) ->

		node = await spawn input, options

		node.stdout.pipe process.stdout
		node.stderr.pipe process.stderr

program.parse process.argv
