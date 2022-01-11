
# import nodeExternals	from 'webpack-node-externals'
import TerserPlugin		from 'terser-webpack-plugin'
import webpack			from 'webpack'
import path				from 'path'
import { expose }		from 'threads/worker'

# import nodeLoader		from 'node-loader'
# import coffeeLoader		from 'coffee-loader'

webpackOptions = {
	target: 'node'
	context: process.cwd()
	devtool: false
	node: {
		__dirname: false
		__filename: false
	}
	# externals: [ nodeExternals(), 'aws-sdk' ]
	stats: 'minimal'
	performance: {
		# Turn off size warnings for entry points
		hints: false
	}
	module: {
		strictExportPresence: true
		rules: [
			{
				loader: require.resolve 'coffee-loader'
				test: /\.coffee$/
			}
			{
				loader: require.resolve 'node-loader'
				test: /\.node$/
			}
		]
	}
	resolve: {
		extensions: [ '.js', '.jsx', '.coffee' ]
	}
}

expose {
	build: (inputFile, outputFile, options) ->
	# await new Promise (resolve) ->
	# 	setTimeout resolve, 1000

	# return true

		options = {
			minimize: true
			externals: []
			...options
		}

		return new Promise (resolve, reject) ->
			compiler = webpack Object.assign {}, webpackOptions, {
				entry:	inputFile
				mode:	if options.minimize then 'production' else 'development'
				optimization: {
					minimize: options.minimize
					minimizer: [
						new TerserPlugin {
							parallel: true
							terserOptions: {
								output: {
									comments: false
								}
							}
						}
					]
				}
				externals: [
					'aws-sdk'
					...options.externals
				]
				output: {
					path:							path.dirname outputFile
					filename:						path.basename outputFile
					libraryTarget:					'commonjs'
					strictModuleExceptionHandling:	true
				}
			}

			compiler.run (error, stats) ->
				if error
					reject error
					return

				data = stats.toJson()

				if data.errors.length
					info = data.errors[ 0 ]
					error = new Error """
						#{ info.message }
						File: #{ info.moduleName }
					"""

					error.file		= info.moduleName
					error.details	= info.details

					# console.error data.errors

					reject error
					return

				resolve stats
}
