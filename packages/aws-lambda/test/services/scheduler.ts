
import { describe, it } from 'vitest'
import { schedule } from '../../src'
import { mockScheduler } from '@heat/aws-test'

describe('Scheduler', () => {

	const mock = mockScheduler()

	it('should schedule a lambda', async () => {
		await schedule({
			name: 'test',
			idempotentKey: 'test',
			payload: {},
			date: new Date,
			roleArn: 'arn:test',
		})

		expect(mock).toBeCalledTimes(1)
	})
})
