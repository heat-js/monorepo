
import handle 		from '../src/handle'
import Timestream 	from '../src/middleware/timestream'

lambda = handle(
	new Timestream
	(app) ->
		hasWriter = app.has 'timestreamWriter'
		hasReader = app.has 'timestreamReader'

		app.output = [ hasWriter, hasReader ]
)

describe 'Test Timestream Middleware', ->
	it 'should throw an error', ->
		result = await lambda()

		expect result
			.toStrictEqual [ true, true ]
