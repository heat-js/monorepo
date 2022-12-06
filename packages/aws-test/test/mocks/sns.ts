
import { describe, it, expect } from 'vitest'
import { createSnsMock } from '../../src'

describe('Sns Mock', () => {

	const sns = createSnsMock({
		service__topic: () => {}
	})

	it('should send', async () => {
		await sns.publish({
			service: 'service',
			topic: 'topic',
		})

		expect(sns.publish).toBeCalledTimes(1)
		expect(sns.$.service__topic).toBeCalledTimes(1)
	})

	it('should throw for unknown queue', async () => {
		await expect(sns.publish({
			service: 'service',
			topic: 'unknown',
		})).rejects.toThrow(TypeError)
	})
})
