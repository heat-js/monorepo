
import { describe, it } from 'vitest'
import { publish } from '../../src'
import { mockIoT } from '@heat/aws-test'

describe('SSM', () => {

	const mock = mockIoT()

	it('should resolve ssm paths', async () => {
		await publish({
			topic: 'test',
			event: 'test',
			value: 'test'
		})

		expect(mock).toBeCalledTimes(1)
	})
})
