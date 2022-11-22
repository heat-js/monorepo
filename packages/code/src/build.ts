
import { mkdir, writeFile } from 'fs/promises'
import { basename, extname, join } from 'path'
import { rollup, RollupOptions } from './rollup/index'

const buildFile = async (input, options:RollupOptions = {}) => {
	const params = {
		minimize: false,
		sourceMap: false,
		external: (importee) => {
			return !['.', '/'].includes(importee[0])
		},
		...options,
	}

	const [ esm, cjs ] = await Promise.all([
		rollup(input, { ...params, format: 'esm' }),
		rollup(input, { ...params, format: 'cjs' })
	])

	return { esm, cjs }
}

const getOutputFile = (outputPath, input) => {
	const ext = extname(input)
	const base = join(process.cwd(), outputPath, basename(input, ext))

	return base
}

export const build = async (inputs, output, options:RollupOptions = {}) => {
	await Promise.all(inputs.map(async input => {
		// const path = getOutputFile(output, input)
		const ext = extname(input)
		const name = basename(input, ext)
		const path = join(process.cwd(), output)

		await mkdir(path, { recursive: true })

		const { esm, cjs } = await buildFile(input, options)
		await Promise.all([
			writeFile(`${path}/${name}.cjs`, cjs.code),
			writeFile(`${path}/${name}.js`, esm.code)
		])
	}))
}
