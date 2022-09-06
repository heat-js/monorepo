import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import coffee from 'coffeescript'
import babelJest from 'babel-jest'

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
		{ js, v3SourceMap } = coffee.compile(
			src
			{ sourceMap: true }
		)

		{ code } = coffee.transpile(
			js
			{
				sourceMap: false,
				presets: ['@babel/env']
			}
		)

		v3SourceMap = JSON.parse v3SourceMap

		map =
			version: v3SourceMap.version
			sources: [file]
			names: []
			mappings: v3SourceMap.mappings
			sourcesContent: [src]

		babelTransformer = babelJest.createTransformer
			inputSourceMap: map

		babelTransformer.process code, file, config, options
