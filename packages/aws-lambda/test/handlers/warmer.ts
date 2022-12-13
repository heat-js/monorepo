
import { describe, it, expect, vi } from 'vitest'
import { handle, warmer } from '../../src'

describe('Warmer', () => {
	const fn = handle({
		handlers: [
			warmer({ log: false }),
			() => 'normal'
		]
	})

	fn.on('before-warmer', (app) => {
		app.something = vi.fn()
	})

	it('should skip the warmer for normal calls', async () => {
		const result = await fn()
		expect(result).toBe('normal')
	})

	it('should warm 1 lambda', async () => {
		const result = await fn({ warmer: true })
		expect(result).toBeUndefined()
		expect(fn.request?.something).toBeCalledTimes(0)
	})

	it('should warm 3 lambda', async () => {
		const fn = handle({
			handlers: [
				warmer({ log: false, concurrency: 3 }),
				() => 'normal'
			]
		})

		const result = await fn({ warmer: true })
		expect(result).toBeUndefined()
		expect(fn.request?.something).toBeCalledTimes(2)
	})

})
