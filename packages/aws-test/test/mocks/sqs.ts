import { describe, it, expect } from 'vitest'
import { createSqsMock } from '../../src'

describe('Sqs Mock', () => {

	const sqs = createSqsMock({
		service__echo: () => {}
	})

	it('should send', async () => {
		await sqs.send({
			service: 'service',
			name: 'echo',
			payload: 'Hello'
		})

		expect(sqs.send).toBeCalledTimes(1)
		expect(sqs.$.service__echo).toBeCalledTimes(1)
	})

	it('should throw for unknown queue', async () => {
		await expect(sqs.send({
			service: 'service',
			name: 'unknown',
			payload: 'Hello'
		})).rejects.toThrow(TypeError)
	})
})
