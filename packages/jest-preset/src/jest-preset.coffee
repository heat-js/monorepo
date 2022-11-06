
import path from 'path'
import { FILE_EXTENSIONS } from 'coffeescript'
# import { defaults } from 'jest-config'

javascriptExtensions = [ 'js', 'mjs', 'cjs', 'jsx' ]
coffeescriptExtensions = FILE_EXTENSIONS.map (ext) => ext[1..]

extensions = [
	...javascriptExtensions
	...coffeescriptExtensions
]

export default {
	moduleFileExtensions: [
		'md'
		'html'
		'json'
		...extensions
	]

	testMatch: [
		path.join process.cwd(), "test/**/*.@(#{extensions.join '|'})"
	]

	testEnvironment: 'node'

	# rootDir: path.join process.cwd(), 'test'

	dependencyExtractor: path.join __dirname, 'dependencyExtractor.js'

	# transformIgnorePatterns: []

	transform: {
		'^.+\\.(md|html)$': '@heat/jest-raw-loader'
		"^.+\\.(#{coffeescriptExtensions.join '|'})$": path.join __dirname, 'transform.js'
		"^.+\\.(#{javascriptExtensions.join '|'})$": [
			"babel-jest"
			{
				plugins: [
					'@babel/plugin-syntax-jsx'
				],
				presets: [
					[
						'@babel/preset-env'
						{
							targets: {
								node: 'current'
							}
						}
					]
					[
						'@babel/preset-react'
						{
							pragma: 'h'
							pragmaFrag: 'Fragment'
							throwIfNamespace: false
						}
					]
				]
			}
		]
	}
}
