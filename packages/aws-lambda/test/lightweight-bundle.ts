
import { describe, it, expect } from 'vitest'
import { bundle } from '@heat/code'
import { join } from 'path'

describe('Lightwight Bundle', () => {

	const code = async (file) => {
		const path = join(process.cwd(), `test/bundle/${ file }.js`)
		const result = await bundle(path, {
			sourceMap: false,
			format: 'esm',
			minimize: true,
			moduleSideEffects: (id) => {
				return (path === id)
			},
			external:(importee) => {
				return importee.indexOf('aws-sdk') === 0
			}
		})

		return result.code.trim()
	}

	it('should strip away all unused code', async () => {
		const result = await code('empty')

		expect(result).toBe('')
	}, 100000)

	it('should bundle only the handle code', async () => {
		const result = await code('some')

		expect(result.length).toBeGreaterThanOrEqual(1000)
		expect(result.length).toBeLessThanOrEqual(1500)
	}, 100000)
})
