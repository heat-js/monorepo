
import { describe, it } from 'vitest'
import { handle, ssm } from '../../src'

describe('SSM', () => {

	const fn = handle({
		handlers: [ ssm() ]
	})

	it('should resolve ssm values inside process.env', async () => {
		await fn()
	})

})
