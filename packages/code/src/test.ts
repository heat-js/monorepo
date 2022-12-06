
import { join } from 'path'
import { readFile } from 'fs/promises'
import { mergeConfig, PluginOption } from 'vite'
import { startVitest } from 'vitest/node'
import { configDefaults } from 'vitest/config'
import { plugins } from './rollup/index'

export const test = async (filters:string[] = []) => {
	const json = await readFile(join(process.cwd(), 'package.json'))
	const data = JSON.parse(json.toString())
	const config = data?.vitest || {}

	await startVitest('test', filters, {
		watch: false,
		ui: false
	}, {
		plugins: plugins({
			minimize: false,
			sourceMap: true
		}) as PluginOption[],
		test: mergeConfig(config, ({
			include: ['./test/**/*.{js,jsx,coffee,ts}'],
			exclude: configDefaults.exclude,
			globals: true,
		}))
	})
}
