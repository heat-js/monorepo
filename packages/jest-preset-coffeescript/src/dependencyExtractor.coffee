{ createHash } = require 'crypto'
{ readFileSync } = require 'fs'
coffee = require 'coffeescript'

module.exports =
	extract: (code, filePath, defaultExtract) ->
		if coffee.helpers.isCoffee filePath
			code = coffee.compile code

		defaultExtract code, filePath

	getCacheKey: ->
		createHash 'md5'
			.update readFileSync __filename
			.digest 'hex'
