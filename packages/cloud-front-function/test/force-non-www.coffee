
import handle 		from '../src/handle'
import forceNonWww 	from '../src/middleware/force-non-www'

describe 'Force Non Www', ->
	cfFunction = handle(
		forceNonWww()
		(app) ->
			app.output = app.input.response
	)

	it 'should return a 301 redirect', ->
		headers = {
			host: {
				value: 'www.domain.com'
			}
		}

		result = await cfFunction {
			request:  { headers, uri: '' }
			response: { statusCode: 200 }
		}

		expect result
			.toStrictEqual {
				statusCode: 301
				statusDescription: 'Redirecting to apex domain'
				headers: { location: { value: 'https://domain.com' } }
			}

	it 'should not redirect but return the normal response', ->
		headers = {
			host: {
				value: 'domain.com'
			}
		}

		result = await cfFunction {
			request:  { headers, uri: '' }
			response: { statusCode: 200 }
		}

		expect result
			.toStrictEqual {
				statusCode: 200
			}
