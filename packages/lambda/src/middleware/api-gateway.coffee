
import ViewableError from '../error/viewable-error'

export default class ApiGateway

	formatErrorMessage: (message) ->
		search = '[viewable] '
		if 0 is message.indexOf search
			return message.slice search.length

		return message

	handle: (app, next) ->

		app.request = ->
			return Request.fromApiGateway app.input

		app.response = ->
			return new Response app.request

		try
			await next()

		catch error
			if error instanceof ViewableError
				app.response
					.status error.status or 400
					.json { message: @formatErrorMessage error.message }

			else if process.env.DEBUG
				throw error

			else
				# Log error in CloudWatch
				console.error error

				# Log error in BugSnag
				if app.has 'notify'
					await app.notify error

				app.response.status 500
				app.response.json {
					message: 'Internal server error'
				}

		app.output = app.response.toApiGatewayResponse()


export class Request

	@parseHeaders = (headers = {}) ->
		result = {}
		for name, value of headers
			name = name.toLowerCase()

			if name is 'referer'
				name = 'referrer'

			result[name] = value

		return result

	# @parseIps = (headers) ->
	# 	ips = headers['x-forwarded-for'] or ''
	# 	ips = ips.split ','
	# 	ips = ips.map (ip) ->
	# 		return ip.trim()

	# 	ips = ips.filter (ip) ->
	# 		return ip

	# 	return ips

	@parseMethod = (method = 'GET') ->
		return method.toUpperCase()

	@parseBody = (body, type = '') ->
		if -1 < type.indexOf 'json'
			return JSON.parse body

		return body

	@fromApiGateway: (input) ->
		data = {
			path: 		input.path
			method: 	input.httpMethod
			headers:	input.headers
			params: 	input.pathParameters
			query:		input.queryStringParameters
			body:		input.body
			ip:			input.requestContext.identity.sourceIp
		}

		return new Request data

	constructor: (options = {}) ->
		@method 	= Request.parseMethod options.method
		@headers 	= Request.parseHeaders options.headers
		@params 	= options.params or {}
		@query 		= options.query or {}
		@body 		= Request.parseBody options.body, @headers['content-type']
		@ip 		= options.ip

	get: (name, defaultValue) ->
		return @headers[name.toLowerCase()] or defaultValue



export class Response

	@TYPES = {
		text: 	'text/plain'
		html: 	'text/html'
		bin:	'application/octet-stream'
	}

	constructor: (@request) ->
		@headers 	= {}
		@statusCode = 200
		@body 		= ''

	status: (@statusCode) ->
		return @

	type: (contentType, charset = 'utf-8') ->
		mime = Response.TYPES[contentType] or contentType
		@set 'content-type', mime + '; charset=' + charset
		return @

	get: (name) ->
		return @headers[name.toLowerCase()]

	set: (name, value) ->
		@headers[name.toLowerCase()] = value
		return @

	remove: (name) ->
		delete @headers[name.toLowerCase()]
		return @

	send: (body) ->
		# -------------------------------------------
		# Populate Content-Type

		switch typeof body
			when 'string'
				if not @get 'content-type'
					@type 'html'

			when 'boolean', 'number', 'object'
				if body is null
					body = ''
				else if Buffer.isBuffer body
					if not @get 'content-type'
						@type 'bin'
				else
					return @json body

		# -------------------------------------------
		# Populate Content-Length

		if typeof body isnt 'undefined'
			if Buffer.isBuffer body
				length = body.length
			else if body.length < 1000
				length = Buffer.byteLength body, 'utf8'
			else
				buffer = Buffer.from body, 'utf8'
				length = buffer.length

			@set 'content-length', length

		@body = body
		return @

	json: (body) ->
		if not @get 'content-type'
			@set 'content-type', 'application/json'

		body = JSON.stringify body
		return @send body

	redirect: (url) ->
		@status 302
		@set 'location', url
		return @

	toApiGatewayResponse: ->
		statusCode 	= parseInt @statusCode, 10
		body 		= @body
		headers 	= Object.assign {}, @headers

		if @request.method is 'HEAD'
			body = ''

		# Strip irrelevant headers
		if statusCode is 204 or statusCode is 304
			delete headers['content-type']
			delete headers['content-length']
			delete headers['content-encoding']
			body = ''

		return {
			isBase64Encoded: false
			statusCode
			headers
			body
		}
