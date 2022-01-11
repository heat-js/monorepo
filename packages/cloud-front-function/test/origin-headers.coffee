
import handle 			from '../src/handle'
import OriginHeaders 	from '../src/middleware/origin-headers'

describe 'Security Headers', ->
	cfFunction = handle(
		new OriginHeaders
		(app) ->
			app.output = app.input.response
	)

	it 'should set the correct headers', ->
		headers = {
			'x-amz-meta-content-type-options': {
				value: 'nosniff'
			}
		}

		result = await cfFunction {
			response: { headers, statusCode: 200 }
		}

		expect result
			.toStrictEqual {
				statusCode: 200
				headers: {
					'content-type-options': {
						value: 'nosniff'
					}
				}
			}
