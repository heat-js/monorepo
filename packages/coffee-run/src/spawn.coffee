
import { rollup }		from 'rollup'
import coffeescript		from 'rollup-plugin-coffee-script'
import nodeResolve		from 'rollup-plugin-node-resolve'
import babel 			from '@rollup/plugin-babel'
import commonjs			from '@rollup/plugin-commonjs'
import json 			from '@rollup/plugin-json'
import { spawn }		from 'child_process'

export default (input, options) ->
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
			coffeescript()
			babel({
				plugins: ['@babel/plugin-transform-runtime']
				presets:[
					['@babel/preset-env', { targets: { esmodules: false }} ]
					['@babel/preset-react', {
						pragma: 'h'
						pragmaFrag: 'Fragment'
						throwIfNamespace: false
					}]
				]
				babelrc: false
				extensions: ['js', '.jsx']
				babelHelpers: 'runtime'
			})
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

	node.stdin.write code
	node.stdin.end()

	return node
