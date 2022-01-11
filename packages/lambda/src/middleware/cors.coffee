
import Middleware 		from './abstract'
import ViewableError 	from '../error/viewable-error'

export default class Cors extends Middleware

	constructor: ({ @blocking = false, @origins }) ->
		super()

	getOrigins: (app) ->
		return (
			@origins or
			(
				app.has('config') and
				app.config.cors and
				app.config.cors.origins
			)
		)

	handle: (app, next) ->
		allowed = @getOrigins app
		origin 	= app.request.get 'origin'

		if not Array.isArray allowed
			throw new TypeError 'CORS origins has not been set'

		if origin and allowed.includes origin
			app.response.set 'access-control-expose-headers', [
				'content-length'
				'content-type'
			].join ','

			app.response.set 'access-control-allow-origin', origin
			# app.response.set 'access-control-allow-credentials', 'true'
			# app.response.set 'access-control-allow-headers', [
			# 	'content-type'
			# 	'x-token'
			# ].join ','

			await next()
			return

		if @blocking
			error = new ViewableError 'Origin not allowed'
			error.status = 403
			throw error

		await next()
