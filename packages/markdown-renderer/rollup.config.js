import copy from 'rollup-plugin-copy'

export default [
	{
		input: './src/__index.js',
		plugins: [
			copy({
				targets: [
					{ src: './package.json', dest: '.build' }
				]
			}),
		],
		output: [
			// { format: 'es', file: './dist/esm/index.js' },
			{ format: 'cjs', file: '.build/index.js' }
		]
	}
]
