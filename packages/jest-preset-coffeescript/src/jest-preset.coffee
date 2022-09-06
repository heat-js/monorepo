
import path from 'path'
import { FILE_EXTENSIONS } from 'coffeescript'

extensions = FILE_EXTENSIONS.map (ext) => ext[1..]

module.exports =
	moduleFileExtensions: [ 'js', 'json', extensions... ]
	# testMatch: ["<rootDir>/*@(test|spec)?(s){/**/,}*.@(#{extensions.join '|'})"]
	testMatch: [ "<rootDir>/**/*.@(#{extensions.join '|'})" ],
	dependencyExtractor: path.join __dirname, 'dependencyExtractor.js'
	transform:
		'\\.coffee$': path.join __dirname, 'transform.js'
