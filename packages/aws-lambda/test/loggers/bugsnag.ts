
import { describe, it, expect, vi } from 'vitest'
import { Bugsnag } from '../../src/loggers/bugsnag/bugsnag'
import { lambda, bugsnag, ViewableError } from '../../src'

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
		const error = new Error()
		const fn = lambda({
			logger: bugsnag(),
			handle(app) {
				throw error
			}
		})

		await expect(fn).rejects.toThrow(error)
	})
})
