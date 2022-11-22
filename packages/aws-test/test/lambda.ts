import { describe, it, expect } from 'vitest'
import { createLambdaMock } from '../src'

describe('Lambda', () => {

	const lambda = createLambdaMock({
		service__echo: (payload) => {
			return payload
		}
	})

	it('should invoke', async () => {
		const result = await lambda.invoke({
			service: 'service',
			name: 'echo',
			payload: 'Hello'
		})

		expect(result).toBe('Hello')
	})

	it('should throw for unknown lambda', async () => {
		await expect(lambda.invoke({
			service: 'service',
			name: 'unknown',
			payload: 'Hello'
		})).rejects.toThrow(TypeError)
	})
})
