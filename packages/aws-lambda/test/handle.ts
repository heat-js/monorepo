
import { number, string, Struct } from 'superstruct'
import { describe, it, expect } from 'vitest'
import { handle, Next } from '../src'

describe('Handle', () => {

	it('should have the API', async () => {
		const lambda = handle({
			handlers: []
		})

		expect(lambda.request).toBeUndefined()

		await lambda()

		expect(lambda.request).toBeDefined()
		expect(lambda.on).toBeDefined()
	})

	it('should echo', async () => {
		const lambda = handle({ handlers: [ (request) => request.input ] })
		const result = await lambda('echo')
		expect(result).toBe('echo')
	})

	it('should noop', async () => {
		const lambda = handle({ handlers: [] })
		const result = await lambda('echo')
		expect(result).toBeUndefined()
	})

	it('should throw #1', async () => {
		const error = new Error()
		const lambda = handle({ handlers: [ () => { throw error } ] })

		await expect(lambda()).rejects.toThrow(error)
	})

	it('should throw #2', async () => {
		const error = new Error()
		const lambda = handle({
			handlers: [
				({ $ }, next) => {
					$.test = () => { throw error }
					return next()
				},
				(request) => request.test,
			]
		})

		await expect(lambda()).rejects.toThrow(error)
	})

	it('should allow deep handlers', async () => {
		handle({
			handlers: [
				() => {},
				[ () => {} ]
			]
		})
	})

	it('should validate input', async () => {
		const lambda = handle({
			input: string(),
			handlers: []
		})

		await lambda('hi')

		// @ts-ignore
		await expect(lambda()).rejects.toThrow(Error)
	})

	it('should validate output', async () => {

		const lambda = handle({
			output: string(),
			handlers: [
				(app) => {
					return app.input as string
				}
			]
		})

		await lambda('hi')

		await expect(lambda()).rejects.toThrow(Error)
	})

	it('should validate input & output', async () => {

		const lambda = handle({
			input: string(),
			output: string(),
			handlers: [
				(app) => {
					return app.input
				}
			]
		})

		await lambda('hi')

	})
})
