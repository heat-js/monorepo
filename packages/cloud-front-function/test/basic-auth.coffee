
import handle 		from '../src/handle'
import basicAuth 	from '../src/middleware/basic-auth'

describe 'Basic Auth', ->
	username = 'user-1'
	password = 'qwerty'

	cfFunction = handle(
		basicAuth 'dXNlci0xOnF3ZXJ0eQ=='
		(app) ->
			app.output = app.input.request
	)

	it 'should succesfull login', ->
		headers = {
			authorization: {
				value: 'Basic ' + Buffer.from(username + ':' + password).toString 'base64'
			}
		}

		result = cfFunction {
			request: { statusCode: 200, headers }
		}

		expect result
			.toStrictEqual {
				statusCode: 200
				headers: {
					authorization: {
						value: 'Basic dXNlci0xOnF3ZXJ0eQ=='
					}
				}
			}

	it 'should fails login with wrong auth', ->
		headers = {
			'authorization': {
				value: 'Basic ' + Buffer.from('wrong-user' + ':' + 'wrong-password').toString 'base64'
			}
		}

		result = cfFunction  {
			request: { statusCode: 200, headers }
		}

		expect result
			.toStrictEqual {
				statusCode: 401
				statusDescription: 'Unauthorized'
				headers: {
					'www-authenticate': {
						value: 'Basic'
					}
				}
			}

	it 'should fails login with no auth', ->
		result = cfFunction  {
			request: { statusCode: 200, headers: {} }
		}

		expect result
			.toStrictEqual {
				statusCode: 401
				statusDescription: 'Unauthorized'
				headers: {
					'www-authenticate': {
						value: 'Basic'
					}
				}
			}
