
import { describe, it, expect, vi } from 'vitest'
import { event, handle } from '../../src'

describe('Event', () => {

	const value = (v) => [
		(app, next) => {
			app.value = v
			return next()
		},
		event(String(v)),
	]

	const fn = handle(
		value(1),
		value(2),
		value(3),
	)

	it('should publish events in order', async () => {
		const c1 = vi.fn((app) => expect(app.value).toBe(1))
		const c2 = vi.fn((app) => expect(app.value).toBe(2))
		const c3 = vi.fn((app) => expect(app.value).toBe(3))

		fn.on('1', c1)
		fn.on('2', c2)
		fn.on('3', c3)

		await fn()

		expect(c1).toBeCalled()
		expect(c2).toBeCalled()
		expect(c3).toBeCalled()
	})

})
