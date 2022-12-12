
import { describe, it, expect } from 'vitest'
import { handle, dynamodb } from '../../src'

describe('DynamoDB', () => {

	it('should expose the API', async () => {
		const fn = handle(
			dynamodb(),
			(app) => app.output = app.dynamodb
		)

		const api = await fn()
		expect(api).toBeDefined()
		expect(api.send).toBeDefined()
	})

})
