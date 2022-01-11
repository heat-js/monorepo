
import { createLambdaMock } from '../../src/lambda/mock'

describe 'Lambda Mock', ->

	mock = createLambdaMock {
		'test': jest.fn ({ a, b }) ->
			return a + b

		'other__test': jest.fn ({ a, b }) ->
			return a * b
	}

	it 'should throw for unknown lambda function', ->
		await expect mock.invoke {
			name: 'unknown'
		}
		.rejects.toThrow 'Lambda mock function not defined for: unknown'

	it 'should be able to call a mocked lambda function', ->
		result = await mock.invoke {
			name: 'test'
			payload: {
				a: 1
				b: 2
			}
		}

		expect result
			.toBe 3

		expect mock.test
			.toHaveBeenCalledTimes 1

	it 'should be able to call a mocked lambda function in a different service', ->
		result = await mock.invoke {
			service: 'other'
			name: 'test'
			payload: {
				a: 3
				b: 3
			}
		}

		expect result
			.toBe 9

		expect mock.other__test
			.toHaveBeenCalledTimes 1
