
import { describe, it, expect, vi } from 'vitest'
import { Bugsnag } from '../../src/handlers/bugsnag/bugsnag'
import { handle, bugsnag, ViewableError } from '../../src'

describe('Bugsnag', () => {

	it('should notify the HTTP REST API via the client', async () => {
		const client = new Bugsnag('')
		const error = new Error('Test')
		const result = await client.notify(error, {
			metaData: {
				test: {
					field:'value'
				}
			}
		})

		expect(result).toBe(true)
	})

	it('should log errors', async () => {
		const mock = vi.fn()
		const error = new Error()
		const fn = handle(
			bugsnag(),
			(app) => {
				app.log = mock
				throw error
			}
		)

		await expect(fn).rejects.toThrow(error)
		expect(mock).toBeCalled()
	})

	it('should ignore viewable errors', async () => {
		const mock = vi.fn()
		const error = new ViewableError('type', 'message')
		const fn = handle(
			bugsnag(),
			(app) => {
				app.log = mock
				throw error
			}
		)

		await expect(fn).rejects.toThrow(error)
		expect(mock).not.toBeCalled()
	})

	it('should NOT ignore viewable errors', async () => {
		const mock = vi.fn()
		const error = new ViewableError('type', 'message')
		const fn = handle(
			bugsnag({ logViewableErrors: true }),
			(app) => {
				app.log = mock
				throw error
			}
		)

		await expect(fn).rejects.toThrow(error)
		expect(mock).toBeCalled()
	})
})
