
import { Command } 		from 'commander'
import { rollup }		from 'rollup'
import coffeescript		from 'rollup-plugin-coffee-script'
import nodeResolve		from 'rollup-plugin-node-resolve'
import jsx 				from 'rollup-plugin-jsx'
import commonjs			from '@rollup/plugin-commonjs'
import json 			from '@rollup/plugin-json'
import { spawn }		from 'child_process'

# import { dirname }	from 'path'
# import packageData	from './package.json'

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

		bundle = await rollup {
			input
			external: (importee) ->
				# console.log 'importee', importee, importee[0]
				if options.includePackages
					return false

				return switch importee[ 0 ]
					when '.', '/' then false
					else true

			onwarn: (error) ->
				if /external dependency/.test error.message
					return

				console.error error.message

			plugins: [
				jsx({ factory: 'h' })
				coffeescript()
				commonjs()
				json()
				nodeResolve({
					preferBuiltins: true
					extensions: ['.js', '.coffee', '.jsx']
				}),
			]
		}

		{ output } = await bundle.generate {
			format: 'cjs'
		}

		code = output[0].code

		if options.env and options.env.length > 0
			node = spawn 'env', [ ...options.env, 'node' ]
		else
			node = spawn 'node'

		node.stdout.pipe process.stdout
		node.stderr.pipe process.stderr
		node.stdin.write code
		node.stdin.end()

program.parse process.argv
