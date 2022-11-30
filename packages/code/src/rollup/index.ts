
import { InputPluginOption, rollup as bundler } from 'rollup'

import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import coffee from './coffee'
import lua from './lua'
import raw from './raw'
import { access } from 'fs/promises'
import { join } from 'path'

export const extensions = [
	'json', 'js', 'jsx', 'coffee', 'ts', 'lua', 'md', 'html'
]

export interface PluginOptions {
	sourceMap?: boolean
	minimize?: boolean
	transpilers?: {
		ts?: boolean
		coffee?: boolean
	}
}

export const plugins = ({ minimize = false, sourceMap = true, transpilers }:PluginOptions = {}) => {
	const transpilersOptions = Object.assign({
		ts: true,
		coffee: true
	}, transpilers)

	return [
		transpilersOptions.coffee && coffee({
			sourceMap
		}),
		transpilersOptions.ts && typescript({
			sourceMap,
		}) as unknown,
		commonjs({ sourceMap }),
		babel({
			sourceMaps: sourceMap,
			// plugins: ['@babel/plugin-transform-runtime'],
			presets: [
				// '@babel/preset-env',
				[ '@babel/preset-react', {
					pragma: 'h',
					pragmaFrag: 'Fragment',
					throwIfNamespace: false
				} ],
			],
			babelrc: false,
			extensions: ['.js', '.jsx'],
			// babelHelpers: 'runtime',
			babelHelpers: 'bundled',
			// generatorOpts: {
			// 	compact: false
			// }
		}),
		json(),
		lua(),
		raw({
			extensions: ['.md', '.html'],
		}),
		nodeResolve({
			preferBuiltins: true,
			extensions: ['.js', '.coffee', '.jsx']
		}),
		minimize && uglify({
			sourcemap: sourceMap,
			toplevel: true,
		}),
	]
}

export interface RollupOptions {
	format?: 'cjs' | 'esm'
	sourceMap?: boolean
	external?: (importee) => boolean
	minimize?: boolean
	moduleSideEffects?: boolean | string[] | 'no-external' | ((id: string, external: boolean) => boolean)
	exports?: 'auto' | 'default' | 'named' | 'none'
	transpilers?: {
		ts?: boolean
		coffee?: boolean
	}
}

const shouldIncludeTypescript = async (transpilers) => {
	if(transpilers.ts) {
		const path = join(process.cwd(), 'tsconfig.json')

		try {
			await access(path)
			return { ...transpilers, ts: true }
		} catch(error) {
			return { ...transpilers, ts: false }
		}
	}

	return transpilers
}

export const rollup = async (input, options:RollupOptions = {}) => {

	const {
		minimize = false,
		sourceMap = true,
		moduleSideEffects = true,
		format = 'cjs',
		transpilers = [ 'ts', 'coffee' ],
		// exports = 'default',
		external
	} = options

	const bundle = await bundler({
		input,
		external,

		plugins: plugins({
			minimize,
			sourceMap,
			transpilers: await shouldIncludeTypescript(transpilers)
		}) as InputPluginOption[],

		treeshake: {
			moduleSideEffects
		},

		onwarn(warning) {
			const ignore = [ 'CIRCULAR_DEPENDENCY' ]
			if (!ignore.includes(warning.code)) {
				console.error(`(!) ${warning.message}`)
			}
		},
	})

	const { output: [output] } = await bundle.generate({
		format,
		sourcemap: sourceMap,
		exports: options.exports
	})

	return {
		code: output.code,
		map: output.map || undefined
	}
}
