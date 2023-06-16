
import { createSqsMock } from '../src/index'

describe 'Sqs Mock', ->

	mock = createSqsMock [
		'test__test'
		'bla__bla'
	]

	beforeEach ->
		vi.clearAllMocks()

	it 'should be able to send to a mocked sqs queue', ->
		await mock.send {
			service: 'test'
			name: 	 'test'
		}

		expect mock['test__test']
			.toHaveBeenCalledTimes 1

		expect mock['bla__bla']
			.not.toHaveBeenCalled()

	it 'should able to send to queues without defining them first', ->
		for i in [ 1..3 ]
			await mock.send {
				service: 'test'
				name: 	 i
			}

		expect mock['test__1']
			.toHaveBeenCalledTimes 1

		expect mock['test__2']
			.toHaveBeenCalledTimes 1

		expect mock['test__3']
			.toHaveBeenCalledTimes 1

		expect mock['test__4']
			.toBeUndefined
