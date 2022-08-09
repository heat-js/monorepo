{ createHash } = require 'crypto';
{ readFileSync } = require 'fs'
coffee = require 'coffeescript'
babelJest = require 'babel-jest'

module.exports =
	getCacheKey: (sourceText, sourcePath, configString) ->
		createHash 'md5'
			.update sourceText
			.update '\0', 'utf8'
			.update sourcePath
			.update '\0', 'utf8'
			.update if typeof configString is 'string' then configString else JSON.stringify configString
			.update '\0', 'utf8'
			.update readFileSync __filename
			.digest 'hex'

	process: (src, file, config, options) ->
		{ js, v3SourceMap } = coffee.compile src, {
			sourceMap: true
			transpile: {
				plugins: [

				]
			}
		}

		v3SourceMap = JSON.parse v3SourceMap

		map =
			version: v3SourceMap.version
			sources: [file]
			names: []
			mappings: v3SourceMap.mappings
			sourcesContent: [src]

		babelTransformer = babelJest.createTransformer
			inputSourceMap: map

		babelTransformer.process js, file, config, options
