
import ViewableError from '../error/viewable-error'

export default class SqsWorker

	constructor: ->

	handle: (app, next) ->

		input = app.input

		# ----------------------------------------------------
		# Single queue processed

		if not (typeof input is 'object' and input isnt null)
			app.value 'records', [{ payload: input }]
			await next()
			return

		if Array.isArray input
			app.value 'records', input.map (payload) ->
				return { payload }

			await next()
			return

		records = input.Records

		if not Array.isArray records
			app.value 'records', [{ payload: input }]
			await next()
			return

		# ----------------------------------------------------
		# Batch of qeueue processed

		payloads = []

		for record in records
			payload = JSON.parse record.body
			msgAttr = record.messageAttributes

			attributes = {}
			for key, attribute of msgAttr
				switch attribute.dataType
					when 'String'
						attributes[key] = attribute.stringValue

			payloads.push {
				payload
				attributes
			}

		app.value 'records', payloads

		try
			await next()
		catch error
			if error instanceof ViewableError
				if app.has 'log'
					app.log error

			throw error
