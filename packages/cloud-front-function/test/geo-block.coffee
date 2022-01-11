
import handle 		from '../src/handle'
import GeoBlock 	from '../src/middleware/geo-block'

describe 'Geo Block', ->
	countries = [ 'NL', 'US' ]
	ips = [ '1.2.3.4' ]

	cfFunction = handle(
		new GeoBlock countries, ips
		(app) ->
			app.output = app.input.request
	)

	it 'should not be redirect because non blacklisted country', ->
		headers = {
			accept: { value: 'text/html' }
			'cloudfront-viewer-country': {
				value: 'FR'
			}
		}

		result = cfFunction {
			viewer:  { ip: '127.0.0.1' }
			request: {
				statusCode: 200
				querystring: { foo: { value: 'bar' } }
				headers
			}
		}

		expect result.statusCode
			.toBe 200

	it 'should be redirect because of blacklisted country', ->
		headers = {
			accept: { value: 'text/html' }
			'cloudfront-viewer-country': {
				value: 'NL'
			}
		}

		result = cfFunction {
			viewer:  { ip: '127.0.0.1' }
			request: {
				statusCode: 200
				querystring: { foo: { value: 'bar' } }
				headers
			}
		}

		expect result.statusCode
			.toBe 302

		# expect result
		# 	.toStrictEqual {
		# 		statusCode: 302
		# 	}

	it 'should be stay on the restricted page', ->
		headers = {
			accept: { value: 'text/html' }
			'cloudfront-viewer-country': {
				value: 'NL'
			}
		}

		result = cfFunction {
			viewer:  { ip: '127.0.0.1' }
			request: {
				statusCode: 200
				querystring: { restricted: { value: 'NL' } }
				headers
			}
		}

		expect result.statusCode
			.toBe 200

	it 'should not be redirect because of a whitelisted ip address', ->
		headers = {
			accept: { value: 'text/html' }
			'cloudfront-viewer-country': {
				value: 'NL'
			}
		}

		result = cfFunction {
			viewer:  { ip: '1.2.3.4' }
			request: {
				statusCode: 200
				querystring: { foo: { value: 'bar' } }
				headers
			}
		}

		expect result.statusCode
			.toBe 200

	it 'should redirect and force correct restricted country', ->
		headers = {
			accept: { value: 'text/html' }
			'cloudfront-viewer-country': {
				value: 'NL'
			}
		}

		result = cfFunction {
			viewer:  { ip: '127.0.0.1' }
			request: {
				statusCode: 200
				querystring: { restricted: { value: 'US' } }
				headers
			}
		}

		expect result.statusCode
			.toBe 302

	it 'should redirect and force non-restricted page', ->
		headers = {
			accept: { value: 'text/html' }
			'cloudfront-viewer-country': {
				value: 'DE'
			}
		}

		result = cfFunction {
			viewer:  { ip: '127.0.0.1' }
			request: {
				statusCode: 200
				querystring: { restricted: { value: 'NL' } }
				headers
			}
		}

		expect result.statusCode
			.toBe 302

	it 'should not be redirected because of non-html page', ->
		headers = {
			accept: { value: '*/*' }
			'cloudfront-viewer-country': {
				value: 'NL'
			}
		}

		result = cfFunction {
			viewer:  { ip: '127.0.0.1' }
			request: {
				statusCode: 200
				headers
			}
		}

		expect result.statusCode
			.toBe 200
