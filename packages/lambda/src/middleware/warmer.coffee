
import Middleware	from './abstract'
import warmer		from 'lambda-warmer'

export default class Warmer extends Middleware

	constructor: (@options) ->
		super()

	handle: (app, next) ->

		options = { correlationId: app.context.awsRequestId }
		options = Object.assign options, @options

		if await warmer app.input, options
			app.output = 'warmed'
			return

		await next()
