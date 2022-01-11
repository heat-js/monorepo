
import Middleware 	from './abstract'
import crypto		from 'crypto'

export default class StatisticsMiddleware extends Middleware

	handle: (app, next) ->
		app.statistics = ->
			return new Statistics app.sqs

		await next()


export class Statistics

	constructor: (@sqs) ->

	generateIdempotentKey: ->
		return crypto
			.randomBytes 32
			.toString 'base64'

	put: (metric) ->
		if not Array.isArray metric
			metric = [ metric ]

		metric = metric.map (item) =>
			return {
				namespace:		item.namespace
				name: 			item.name
				value: 			item.value
				unit: 			item.unit
				dimensions: 	item.dimensions
				idempotentKey:	item.idempotentKey or @generateIdempotentKey()
				date:			item.date or (new Date).toISOString()
			}

		return @sqs.send(
			'statistics'
			'metric'
			metric
		)
