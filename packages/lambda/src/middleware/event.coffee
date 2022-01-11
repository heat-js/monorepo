
import Middleware from './abstract'

export default class Event extends Middleware

	constructor: (@name) ->
		super()

	handle: (app, next) ->

		app.emitter.emit @name, app

		await next()
