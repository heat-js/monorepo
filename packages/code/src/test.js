
import { readFile } from 'fs/promises';
import { join } from 'path';
import { startVitest } from 'vitest/node'
import { defineConfig, configDefaults } from 'vitest/config'
import { mergeConfig } from 'vite'
import { plugins } from './rollup/index.js'

export const test = async (filters) => {

	const json = await readFile(join(process.cwd(), 'package.json'))
	const data = JSON.parse(json);
	const config = data?.vitest || {};

	await startVitest('test', filters, {
		watch: false,
		ui: false
	}, {
		plugins: [...plugins()],
		test: mergeConfig(config, defineConfig({
			include: ['./test/**/*.{js,jsx,coffee,ts}'],
			exclude: configDefaults.exclude,
		}))
	})
}
