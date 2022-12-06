import { describe, it, expect } from 'vitest'
import { createLambdaMock } from '../../src'

describe('Lambda Mock', () => {

	const lambda = createLambdaMock({
		service__echo: (payload) => {
			return payload
		}
	})

	it('should invoke lambda', async () => {
		const result = await lambda.invoke({
			service: 'service',
			name: 'echo',
			payload: 'Hello'
		})

		expect(result).toBe('Hello')
		expect(lambda.invoke).toBeCalledTimes(1)
		expect(lambda.$.service__echo).toBeCalledTimes(1)
	})

	it('should throw for unknown lambda', async () => {
		await expect(lambda.invoke({
			service: 'service',
			name: 'unknown',
			payload: 'Hello'
		})).rejects.toThrow(TypeError)
	})
})
