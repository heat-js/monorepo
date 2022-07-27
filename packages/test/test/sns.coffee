
import { createSnsMock } from '../src/index'

describe 'Sns Mock', ->

	mock = createSnsMock [
		'test__test'
		'bla__bla'
	]

	beforeEach ->
		jest.clearAllMocks()

	it 'should be able to publish a mocked sns topic', ->
		await mock.publish {
			service: 'test'
			topic: 	 'test'
		}

		expect mock['test__test']
			.toHaveBeenCalledTimes 1

		expect mock['bla__bla']
			.not.toHaveBeenCalled()

	it 'should able to publish topics without defining them first', ->
		for i in [ 1..3 ]
			await mock.publish {
				service: 'test'
				topic: 	 i
			}

		expect mock['test__1']
			.toHaveBeenCalledTimes 1

		expect mock['test__2']
			.toHaveBeenCalledTimes 1

		expect mock['test__3']
			.toHaveBeenCalledTimes 1

		expect mock['test__4']
			.toBeUndefined
