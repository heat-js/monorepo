


const webpack		= require('webpack');
const path			= require('path');
const TerserPlugin	= require('terser-webpack-plugin');
const { expose }	= require('threads/worker');

expose({
	build: function(inputFile, outputFile) {
		const compiler = webpack({
			entry:	inputFile,
			output: {
				path:							path.dirname(outputFile),
				filename:						path.basename(outputFile),
				libraryTarget:					'commonjs',
				strictModuleExceptionHandling:	true,
			},
			// mode: 'development',
			mode: 'production',
			target: 'node',
			context: process.cwd(),
			devtool: false,
			node: {
				__dirname: false,
				__filename: false,
			},
			stats: 'minimal',
			performance: {
				hints: false,
			},
			externals: [
				'aws-sdk',
			],
			module: {
				strictExportPresence: true,
				rules: [
					{
						loader: require.resolve('coffee-loader'),
						test: /\.coffee$/,
					},
					// {
					// 	loader: require.resolve('node-loader'),
					// 	test: /\.node$/,
					// },
				],
			},
			resolve: {
				extensions: [ '.js', '.jsx', '.coffee' ]
			},
			optimization: {
				minimizer: [
					new TerserPlugin({
						parallel: true,
						terserOptions: {
							output: {
								comments: false,
							},
						},
					}),
				],
			},
		});

		return new Promise(function(resolve, reject){
			compiler.run(function(error, stats) {
				if(error) {
					return reject(error);
				}

				const data = stats.toJson();
				if(data.errors.length) {
					const info = data.errors[ 0 ];
					const customError = new Error(`${ info.message }\nFile: ${ info.moduleName }`);
					customError.file	= info.moduleName;
					customError.details	= info.details;
					// console.log(customError);
					return reject(customError);
				}

				resolve(data);
				// resolve(process.cwd());
			});
		});
	}
})


// 		compiler.run (error, stats) ->
// 			if error
// 				reject error
// 				return

// 			data = stats.toJson()

// 			if data.errors.length
// 				info = data.errors[ 0 ]
// 				error = new Error """
// 					#{ info.message }
// 					File: #{ info.moduleName }
// 				"""

// 				error.file		= info.moduleName
// 				error.details	= info.details

// 				# console.error data.errors

// 				reject error
// 				return

// 			resolve stats

// exports.build = function(a, b) {
// 	return a + b
// }
