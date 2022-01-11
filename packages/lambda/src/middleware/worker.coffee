
import ViewableError from '../error/viewable-error'

export default class Worker

	handle: (app, next) ->

		input = app.input

		# ----------------------------------------------------
		# Single work processed

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
		# Batch of work processed

		app.value 'records', records.map @parseRecord.bind @

		try
			await next()
		catch error
			if error instanceof ViewableError
				if app.has 'log'
					app.log error

			throw error

	parseRecord: (record) ->
		# SNS
		if record.Sns
			return @parseSnsRecord record

		# SQS
		if record.body
			return @parseSqsRecord record

		throw new Error 'Unrecognized record source: ' + JSON.stringify record

	parseSqsRecord: (record) ->
		attributes = {}
		for key, attribute of record.messageAttributes
			switch attribute.dataType
				when 'String'
					attributes[key] = attribute.stringValue

		return {
			id: 		record.messageId
			payload: 	JSON.parse record.body
			date:		(new Date(Number(record.attributes.SentTimestamp))).toISOString()
			attributes
			raw:		record
		}

	parseSnsRecord: (record) ->
		attributes = {}
		for key, attribute of record.Sns.MessageAttributes
			attributes[key] = attribute.Value

		return {
			id:			record.Sns.MessageId
			payload:	JSON.parse record.Sns.Message
			date:		record.Sns.Timestamp
			topicArn:	record.Sns.TopicArn
			attributes
			raw:		record
		}
