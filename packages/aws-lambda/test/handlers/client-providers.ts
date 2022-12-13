
import { describe, it, expect } from 'vitest'
import { handle, lambda, sqs, sns, iot, dynamodb } from '../../src'

describe('Client Providers', () => {

	const test = (name, middleware) => {
		it(`should expose the ${name} API`, async () => {
			const fn = handle({
				handlers: [
					middleware(),
					(app) => app[name]
				]
			})

			const client:any = await fn()

			expect(client).toBeDefined()
			expect(client.send).toBeDefined()
		})
	}

	test('sqs', sqs)
	test('sns', sns)
	test('iot', iot)
	test('lambda', lambda)
	test('dynamodb', dynamodb)
})
