
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import coffee from 'coffeescript'
import babelJest from 'babel-jest'
import { compile } from '@heat/compiler'

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
		{ code, map } = await compile file, { sourceMap: false }
		console.log code, map
		# { js, v3SourceMap } = coffee.compile(
		# 	src
		# 	{ sourceMap: true }
		# )

		# { code } = coffee.transpile(
		# 	js
		# 	{
		# 		sourceMap: false,
		# 		presets: ['@babel/env']
		# 	}
		# )

		v3SourceMap = JSON.parse map

		map =
			version: v3SourceMap.version
			sources: [file]
			names: []
			mappings: v3SourceMap.mappings
			sourcesContent: [src]

		babelTransformer = babelJest.createTransformer
			inputSourceMap: map

		babelTransformer.process code, file, config, options
