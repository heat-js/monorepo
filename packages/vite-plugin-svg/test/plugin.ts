import { describe, it, expect } from 'vitest'
import svgPlugin from '../src'

describe('Plugin', () => {

	it('should export the ssm parameters', async () => {
		const plugin = svgPlugin({ path: './test/data' })

		// @ts-ignore
		const result = await plugin.load?.('\0virtual:svg') as string
		expect(result.startsWith("export default '/data-")).toBe(true)
	})
})
