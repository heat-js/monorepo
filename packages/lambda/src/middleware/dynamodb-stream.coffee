
import DynamoDB from 'aws-sdk/clients/dynamodb'

export default class DynamoDBStream

	handle: (app, next) ->

		input = app.input

		# ----------------------------------------------------
		# Single queue processed

		if not (typeof input is 'object' and input isnt null)
			app.value 'records', [ input ]
			await next()
			return

		records = input.Records

		if not Array.isArray records
			app.value 'records', [ input ]
			await next()
			return

		# ----------------------------------------------------
		# Batch of qeueue processed

		app.value 'records', records.map (record) ->
			newImage = record.dynamodb.NewImage
			newImage = newImage and DynamoDB.Converter.unmarshall newImage

			oldImage = record.dynamodb.OldImage
			oldImage = oldImage and DynamoDB.Converter.unmarshall oldImage

			return {
				eventName: record.eventName
				newImage
				oldImage
			}

		await next()
