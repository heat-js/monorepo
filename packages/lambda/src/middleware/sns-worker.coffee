
import ViewableError from '../error/viewable-error'

export default class SnsWorker

	handle: (app, next) ->

		input = app.input

		# ----------------------------------------------------
		# Single queue processed

		if not (typeof input is 'object' and input isnt null)
			app.value 'records', [input]
			await next()
			return

		records = input.Records

		if not Array.isArray records
			app.value 'records', [input]
			await next()
			return

		# ----------------------------------------------------
		# Batch of qeueue processed

		payloads = []

		for record in records
			payloads.push JSON.parse record.Sns.Message

		app.value 'records', payloads

		try
			await next()
		catch error
			if error instanceof ViewableError
				if app.has 'log'
					app.log error

			throw error
