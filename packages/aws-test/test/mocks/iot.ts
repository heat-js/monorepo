import { describe, it, expect } from 'vitest'
import { createIotMock } from '../../src'

describe('Iot Mock', () => {

	const iot = createIotMock()

	it('should publish iot message', async () => {
		await iot.publish({
			topic: 'topic',
			event: 'event',
		})

		expect(iot.publish).toBeCalledTimes(1)
	})
})
