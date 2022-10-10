
import { createLambdaMock } from '../src/index'

describe 'Lambda Mock', ->

	lambdaMock = createLambdaMock {
		test: jest.fn -> return true

		unmocked__function: ({ a, b }) -> return a + b
		unmocked__static: 	{ foo: 'bar' }

		mocked__function: 	jest.fn ({ a, b }) -> return a * b
		mocked__static: 	jest.fn -> { foo: 'bar' }
	}

	beforeEach ->
		jest.clearAllMocks()

	it 'should throw for unknown lambda function', ->
		await expect lambdaMock.invoke {
			name: 'unknown'
		}
		.rejects.toThrow 'Lambda mock function not defined for: unknown'

	it 'should be able to call a unmocked function', ->
		result = await lambdaMock.invoke {
			service: 'unmocked'
			name: 'function'
			payload: {
				a: 1
				b: 2
			}
		}

		expect result
			.toBe 3

		expect lambdaMock.unmocked__function
			.toHaveBeenCalledTimes 1

	it 'should be able to call a unmocked static', ->
		result = await lambdaMock.invoke {
			service: 'unmocked'
			name: 'static'
		}

		expect result
			.toStrictEqual { foo: 'bar' }

		expect lambdaMock.unmocked__static
			.toHaveBeenCalledTimes 1

	it 'should be able to call a mocked function', ->
		result = await lambdaMock.invoke {
			service: 'mocked'
			name: 'function'
			payload: {
				a: 3
				b: 3
			}
		}

		expect result
			.toBe 9

		expect lambdaMock.mocked__function
			.toHaveBeenCalledTimes 1

	it 'should be able to call a mocked static', ->
		result = await lambdaMock.invoke {
			service: 'mocked'
			name: 'static'
		}

		expect result
			.toStrictEqual { foo: 'bar' }

		expect lambdaMock.mocked__static
			.toHaveBeenCalledTimes 1

	it 'should be able to call a function in same service', ->
		result = await lambdaMock.invoke {
			name: 'test'
		}

		expect result
			.toBe true

		expect lambdaMock.test
			.toHaveBeenCalledTimes 1
