
const TerserPlugin	= require('terser-webpack-plugin');
const webpack		= require('webpack');
const path			= require('path');
const { expose }	= require('threads/worker');

const webpackOptions = {
	target: 'es5',
	context: process.cwd(),
	stats: 'minimal',
	performance: {
		// Turn off size warnings for entry points
		hints: false,
	},
	optimization: {
		runtimeChunk: true,
		minimizer: [
			new TerserPlugin({
				parallel: true,
				terserOptions: {
					dead_code: true,
					output: {
						comments: true,
					},
				},
			}),
		],
	},
	module: {
		strictExportPresence: false,
		rules: [
			{
				loader: require.resolve('coffee-loader'),
				test: /\.coffee$/,
				options: {
					bare: true
				}
			},
			// {
			// 	loader: require.resolve('node-loader'),
			// 	test: /\.node$/,
			// },
		],
	},
	resolve: {
		extensions: [ '.js', '.jsx', '.coffee' ],
	},
};

expose({
	build: function(inputFile, outputFile, options) {
		var options = {
			minimize: false,
			externals: [],
			...options,
		};

		return new Promise(function(resolve, reject) {
			const compiler = webpack(Object.assign({}, webpackOptions, {
				entry:	inputFile,
				mode:	options.minimize ? 'production' : 'development',
				// devtool: false,
				optimization: {
					minimize: false //options.minimize,
				},
				externals: [
					'aws-sdk',
					...options.externals,
				],
				output: {
					path:							path.dirname(outputFile),
					filename:						path.basename(outputFile),
					libraryTarget:					'var',
					library: 						'handler',
					// chunkFormat:					'push-array',
					// globalObject:					'this',
  					// libraryExport: 					'handler',
					// strictModuleExceptionHandling:	true,
				},
			}));

			compiler.run(function(error, stats) {
				if(error) {
					return reject(error);
				}

				const data = stats.toJson();
				if(data.errors.length) {
					const info			= data.errors[ 0 ];
					const customError	= new Error(`${ info.message }\nFile: ${ info.moduleName }`);
					customError.file	= info.moduleName;
					customError.details	= info.details;
					return reject(customError);
				}

				resolve();
			});
		});
	},
});
