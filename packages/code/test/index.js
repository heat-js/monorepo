
import { bundle, compile, exec, RuntimeError } from '../src'
import { join } from 'path'
// import { describe, it, expect } from 'jest'

describe('Code', () => {

	const testPath = (test) => {
		return join(process.cwd(), 'test/data', test, 'index.js')
	}

	it('should support every file type', async () => {
		const path = testPath('every-file-type')
		const result = await bundle(path)
		const types = ['JS', 'JSX', 'COFFEE', 'JSON', 'HTML', 'MD', 'LUA', 'hash']

		types.forEach((type) => {
			expect(result.code.includes(`${type} =`)).toBe(true)
		})
	})

	it('should remove un-used code (treeshaking)', async () => {
		const path = testPath('treeshaking')
		const result = await bundle(path, { sourceMap: false })
		expect(result.code).toBe("'use strict';\n\n")
	})

	it('should exec', async () => {
		const path = testPath('console-log')
		const result = await exec(path)
		expect(result).toBe('Hello World')
	})

	it('should compile a single file', async () => {
		const path = testPath('compile-single-file')
		const result = await compile(path, { sourceMap: false })
		expect(result.code).toBe(`'use strict';\n\nvar other = require('./other');\n\nother.log('First');\n`)
	})

	it('should bundle all files', async () => {
		const path = testPath('bundle')
		const result = await bundle(path, { sourceMap: false })
		expect(result.code.length).toBeGreaterThan(100)
		expect(result.code).not.toContain('import')
		expect(result.code).not.toContain('require')
	})

	it('should fail for syntax errors', async () => {
		const path = testPath('syntax-error')
		await expect(exec(path))
			.rejects.toThrow(Error)
	})

	it('should fail for runtime errors', async () => {
		const path = testPath('runtime-error')

		await expect(exec(path))
			.rejects.toThrow(RuntimeError)

		await expect(exec(path))
			.rejects.toThrow('Random Error')
	})

	it('should minimize code', async () => {
		const path = testPath('minimize')

		const result1 = await compile(path, { minimize: false, sourceMap: false })
		expect(result1.code).toBe(`'use strict';\n\nvar long_variable_name = 1;\nconsole.log(long_variable_name);\n`)

		const result2 = await compile(path, { minimize: true, sourceMap: false })
		expect(result2.code).toBe(`"use strict";console.log(1);\n`)
	})

	it('should format export/import code correcly', async () => {
		const path = testPath('format')

		const result1 = await compile(path, { sourceMap: false, format:'cjs' })
		expect(result1.code).toBe(`'use strict';\n\nvar index = (function (event, context, callback) {\n  callback(null, event);\n});\n\nmodule.exports = index;\n`)

		const result2 = await compile(path, { sourceMap: false, format: 'esm' })
		expect(result2.code).toBe(`var index = (function (event, context, callback) {\n  callback(null, event);\n});\n\nexport { index as default };\n`)
	})

	it('should generate a source map', async () => {
		const path = testPath('bundle')
		const result = await bundle(path, { sourceMap: true })
		expect(result.map.toString()).toBeDefined()
	})

	it('should ignore bundling externals', async () => {
		const path = testPath('external')
		const result = await bundle(path, {
			sourceMap: false,
			external: (importee) => {
				return importee === './file1.js'
			}
		})

		expect(result.code).toContain("require('./file1.js');")
		expect(result.code).not.toContain("console.log('1');")
		expect(result.code).toContain("console.log('2');")
	})

	it('should export named default', async () => {
		const path = testPath('export-default')
		const result = await bundle(path, {
			sourceMap: false,
			exports: 'named',
		})

		expect(result.code).toContain('exports.default = ')
	})
})
