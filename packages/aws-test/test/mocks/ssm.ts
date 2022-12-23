
import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm'
import { describe, it, expect } from 'vitest'
import { mockSSM } from '../../src'

describe('SSM Mock', () => {

	mockSSM({
		'/path': 'secret'
	})

	const client = new SSMClient({})

	it('should get parameters', async () => {
		const result = await client.send(new GetParametersCommand({
			Names: [ '/path', '/unknown' ]
		}))

		expect(result.Parameters).toStrictEqual([{
			Name: '/path',
			Value: 'secret'
		}, {
			Name: '/unknown',
			Value: ''
		}])
	})
})
