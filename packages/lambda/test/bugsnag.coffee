
import handle 	from '../src/handle'
import Bugsnag	from '../src/middleware/bugsnag'

describe 'Bugsnag', ->

	it 'should run normally', ->
		lambda = handle(
			new Bugsnag
			(app) ->
				app.output = 'bar'
		)

		result = await lambda()

		expect result
			.toBe 'bar'

	it 'should log error', ->
		lambda = handle(
			new Bugsnag
			->
				throw new Error 'Some error'
		)

		await expect lambda { foo: 'bar' }
			.rejects.toThrow 'Some error'
