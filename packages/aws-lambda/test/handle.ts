
import { string, StructError } from 'superstruct'
import { describe, it, expect, vi } from 'vitest'
import { handle, ValidationError, ViewableError } from '../src'

describe('Handle', () => {

	it('should echo', async () => {
		const lambda = handle({ handle: ({ input }) => input })
		const result = await lambda('echo')
		expect(result).toBe('echo')
	})

	it('should noop', async () => {
		const lambda = handle({ handle: () => {} })
		const result = await lambda('echo')
		expect(result).toBeUndefined()
	})

	it('should throw correctly', async () => {
		const error = new Error()
		const lambda = handle({ handle: () => { throw error } })

		await expect(lambda()).rejects.toThrow(error)
	})

	it('should allow deep middleware handlers', async () => {
		const lambda = handle({
			handle: [
				(_, next) => next(),
				[ () => 'works' ]
			]
		})

		const result = await lambda()
		expect(result).toBe('works')
	})

	it('should validate input', async () => {
		const lambda = handle({
			input: string(),
			handle() {}
		})

		await lambda('hi')

		// @ts-ignore
		await expect(lambda()).rejects.toThrow(ValidationError)
	})

	it('should validate output', async () => {
		const lambda = handle({
			output: string(),
			handle({ input }) {
				return input as string
			}
		})

		await lambda('hi')
		await expect(lambda()).rejects.toThrow(StructError)
	})

	it('should validate input & output', async () => {
		const lambda = handle({
			input: string(),
			output: string(),
			handle({ input }) {
				return input
			}
		})

		const result = await lambda('hi')
		expect(result).toBe('hi')
	})

	it('should log errors', async () => {
		const logger = vi.fn()
		const error = new Error()
		const fn = handle({
			logger,
			handle() {
				throw error
			}
		})

		await expect(fn).rejects.toThrow(error)
		expect(logger).toBeCalledTimes(1)
	})

	it('should ignore viewable errors', async () => {
		const logger = vi.fn()
		const error = new ViewableError('type', 'message')
		const fn = handle({
			logger,
			handle() {
				throw error
			}
		})

		await expect(fn).rejects.toThrow(error)
		expect(logger).toBeCalledTimes(0)
	})

	it('should NOT ignore viewable errors', async () => {
		const logger = vi.fn()
		const error = new ViewableError('type', 'message')
		const fn = handle({
			logViewableErrors: true,
			logger,
			handle() {
				throw error
			}
		})

		await expect(fn).rejects.toThrow(error)
		expect(logger).toBeCalledTimes(1)
	})
})
