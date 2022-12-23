
import { describe, it } from 'vitest'
import { handle, invoke } from '../../src'
import { mockLambda } from '@heat/aws-test'
import { string } from 'superstruct'

describe('Lambda', () => {

	const mock = mockLambda({
		echo: (payload) => payload,
		noop: () => {},
	})

	it('should invoke lambda', async () => {
		const result = await invoke({
			name: 'echo',
			payload: 'hi'
		})

		expect(result).toBe('hi')
		expect(mock.echo).toBeCalledTimes(1)
	})

	it('should invoke without payload', async () => {
		const result = await invoke({
			name: 'noop',
		})

		expect(result).toBe(undefined)
		expect(mock.noop).toBeCalledTimes(1)
	})

	it('should play well with payload type validation', async () => {
		const lambda = handle({
			input: string(),
			output: string(),
			handle: ({ input }) => input
		})

		const result = await invoke<typeof lambda>({
			name: 'noop',
			payload: 'hi'
		})

		expect(result).toBe('hi')
	})
})
