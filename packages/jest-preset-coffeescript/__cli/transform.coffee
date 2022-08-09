coffee = require 'coffeescript'
babelJest = require 'babel-jest'

src = 'import path from "path"; console.log 1';
file = ''
config = {}
options = {}

{ js, v3SourceMap } = coffee.compile src, {
	sourceMap: true,
	bare: true,
	transpile: {
		plugins: ['babel-plugin-transform-es2015-modules-commonjs']
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

output = babelTransformer.process js, file, config, options

console.log output
