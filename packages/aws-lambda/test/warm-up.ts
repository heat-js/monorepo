
import { mockLambda } from '@heat/aws-test'
import { string } from 'superstruct'
import { describe, it, expect } from 'vitest'
import { lambda } from '../src'

describe('Warm up support', () => {

	process.env.AWS_LAMBDA_FUNCTION_NAME = 'test'

	const mock = mockLambda({
		test: () => {}
	})

	const fn = lambda({
		handle: () => 'normal'
	})

	it('should skip the warmer for normal calls', async () => {
		const result = await fn()
		expect(result).toBe('normal')
		expect(mock.test).toBeCalledTimes(0)
	})

	it('should warm 1 lambda', async () => {
		const result = await fn({ warmer: true, concurrency: 1 })
		expect(result).toBeUndefined()
		expect(mock.test).toBeCalledTimes(0)
	})

	it('should warm 3 lambda', async () => {
		const result = await fn({ warmer: true, concurrency: 3 })
		expect(result).toBeUndefined()
		expect(mock.test).toBeCalledTimes(2)
	})

	it('should work with validation structs', async () => {
		const fn = lambda({
			input: string(),
			output: string(),
			handle: () => 'normal'
		})

		// @ts-ignore
		const result = await fn({ warmer: true })
		expect(result).toBeUndefined()
	})

})
