
import { mockLambda } from '@heat/aws-test'
import { string } from 'superstruct'
import { describe, it, expect } from 'vitest'
import { handle, warmer } from '../../src'

describe('Warmer', () => {

	process.env.AWS_LAMBDA_FUNCTION_NAME = 'test'

	const lambda = mockLambda({
		test: () => {}
	})

	const fn = handle({ handle: [
		warmer({ log: false }),
		() => 'normal'
	]})

	it('should skip the warmer for normal calls', async () => {
		const result = await fn()
		expect(result).toBe('normal')
		expect(lambda.test).toBeCalledTimes(0)
	})

	it('should warm 1 lambda', async () => {
		const result = await fn({ warmer: true })
		expect(result).toBeUndefined()
		expect(lambda.test).toBeCalledTimes(0)
	})

	it('should warm 3 lambda', async () => {
		const fn = handle({ handle: [
			warmer({ log: false, concurrency: 3 }),
			() => 'normal'
		]})

		const result = await fn({ warmer: true })
		expect(result).toBeUndefined()
		expect(lambda.test).toBeCalledTimes(2)
	})

	it('should work with validation structs', async () => {
		const fn = handle({
			input: string(),
			output: string(),
			handle: [
				warmer({ log: false }),
				() => 'normal'
			]
		})

		// @ts-ignore
		const result = await fn({ warmer: true })
		expect(result).toBeUndefined()
	})

})
