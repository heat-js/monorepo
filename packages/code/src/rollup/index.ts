
import { InputPluginOption, rollup as bundler } from 'rollup'

import coffeescript from 'rollup-plugin-coffee-script'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import lua from './lua'
import raw from './raw'

export const extensions = [
	'json', 'js', 'jsx', 'coffee', 'ts', 'lua', 'md', 'html'
]

export const plugins = ({ minimize = false, sourceMap = true } = {}) => [
	coffeescript({ sourceMap, extensions: ['.coffee'] }),
	typescript({ sourceMap }),
	commonjs({ sourceMap }),
	babel({
		sourceMaps: sourceMap,
		plugins: ['@babel/plugin-transform-runtime'],
		presets: [
			'@babel/preset-env',
			['@babel/preset-react', {
				pragma: 'h',
				pragmaFrag: 'Fragment',
				throwIfNamespace: false
			}],
		],
		babelrc: false,
		extensions: ['.js', '.jsx'],
		babelHelpers: 'runtime',
		generatorOpts: {
			compact: false
		}
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

export interface RollupOptions {
	format?: 'cjs' | 'esm'
	sourceMap?: boolean
	external?: (importee) => boolean
	minimize?: boolean
	moduleSideEffects?: boolean | string[] | 'no-external' | ((id: string, external: boolean) => boolean)
	exports?: 'auto' | 'default' | 'named' | 'none'
}

export const rollup = async (input, options:RollupOptions = {}) => {

	const {
		minimize = false,
		sourceMap = true,
		moduleSideEffects = true,
		format = 'cjs',
		// exports = 'default',
		external
	} = options

	const bundle = await bundler({
		input,
		external,
		plugins: plugins({ minimize, sourceMap }) as InputPluginOption[],
		onwarn(error) {
			if (/external dependency/.test(error.message)) return
		},
		treeshake: {
			moduleSideEffects
		}
	})

	const { output: [output] } = await bundle.generate({
		format,
		sourcemap: sourceMap,
		exports: options.exports
	})

	return {
		code: output.code,
		map: output.map
	}
}
