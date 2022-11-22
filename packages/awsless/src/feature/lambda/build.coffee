
import { bundle }	from '@heat/code'
import writeFile	from '../fs/write-file'

export default (input, output, options) ->
	{ code, map } = await bundle input, {
		...options
		format: 'esm'
		sourceMap: true
		# exports: 'named'
		external: (importee) ->
			if importee.indexOf('aws-sdk') is 0
				return true

			if importee.indexOf('@aws-sdk') is 0
				return true

			return (options.externals or []).includes importee

		moduleSideEffects: (id) ->
			return input is id
	}

	writeFile output, code
	writeFile "#{output}.map", map.toString()

	# await Promise.all [
	# 	writeFile output, code
	# 	writeFile "#{output}.map", map.toString()
	# ]
