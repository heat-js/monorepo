
import { describe, it } from 'vitest'
import { addQueueBatch, addQueueMessage, sendNotification } from '../../src'
import { mockSQS } from '@heat/aws-test'

describe('SQS', () => {

	const mock = mockSQS({
		test: () => {}
	})

	it('should add a queue message', async () => {
		await addQueueMessage({
			name: 'test',
			payload: 1
		})

		expect(mock.test).toBeCalledTimes(1)
	})

	it('should batch multiple queue messages', async () => {
		await addQueueBatch({
			name: 'test',
			items: [
				{ payload: 2 },
				{ payload: 3 }
			]
		})

		expect(mock.test).toBeCalledTimes(2)
	})
})
