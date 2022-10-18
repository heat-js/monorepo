import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import coffee from 'coffeescript'

module.exports =
	extract: (code, filePath, defaultExtract) ->
		if coffee.helpers.isCoffee filePath
			code = coffee.compile code

		defaultExtract code, filePath

	getCacheKey: ->
		createHash 'md5'
			.update readFileSync __filename
			.digest 'hex'
