
import { describe, it, expect } from 'vitest'
import { handle, lambda } from '../../src'

describe('Lambda', () => {

	const fn = handle({
		handlers: [
			lambda(),
			(app) => app.lambda
		]
	}
	)

	it('should expose the API', async () => {
		const api = await fn()
		expect(api.invoke).toBeDefined()
		// expect(lambda.invokeAsync).toBeDefined()
	})

})
