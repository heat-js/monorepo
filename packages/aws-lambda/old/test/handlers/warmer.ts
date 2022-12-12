
import { describe, it, expect, vi } from 'vitest'
import { handle, warmer } from '../../src'

describe('Warmer', () => {
	const fn = handle(
		warmer({ log: false }),
		// event('before'),
		(app) => app.output = 'normal'
	)

	fn.on('before-warmer', (app) => {
		app.lambda = { invoke: vi.fn() }
	})

	it('should skip the warmer for normal calls', async () => {
		const result = await fn()
		expect(result).toBe('normal')
	})

	it('should warm 1 lambda', async () => {
		const result = await fn({ warmer: true })
		expect(result).toBe('warmed')
		expect(fn.app?.lambda.invoke).toBeCalledTimes(0)
	})

	it('should warm 3 lambda', async () => {
		const result = await fn({ warmer: true, concurrency: 3 })
		expect(result).toBe('warmed')
		expect(fn.app?.lambda.invoke).toBeCalledTimes(2)
	})

})
