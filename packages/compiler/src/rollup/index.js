
import coffeescript from 'rollup-plugin-coffee-script'
import nodeResolve from 'rollup-plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import lua from './lua.js'
import raw from './lua.js'

export const plugins = ({ sourceMap = true }) => [
	babel({
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
		babelHelpers: 'runtime'
	}),
	coffeescript({ sourceMap }),
	typescript(),
	commonjs(),
	json(),
	lua(),
	raw({
		extensions: ['.md', '.html'],
	}),
	nodeResolve({
		preferBuiltins: true,
		extensions: ['.js', '.coffee', '.jsx']
	}),
];
