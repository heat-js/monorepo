
import Middleware 	from './abstract'
import SQS			from 'aws-sdk/clients/sqs'

export default class SqsMiddleware extends Middleware

	region: (app) ->
		return (
			app.has('config') and
			app.config.aws and
			app.config.aws.region
		) or (
			process.env.AWS_REGION
		) or (
			'eu-west-1'
		)

	handle: (app, next) ->
		app.sqsClient = =>
			return new SQS {
				apiVersion: '2012-11-05'
				region: 	@region app
			}

		app.sqsUrlResolver = ->
			return new SqsUrlResolver app.sqsClient

		app.sqs = ->
			return new Sqs(
				app.sqsClient
				app.sqsUrlResolver
			)

		await next()


export class Sqs

	constructor: (@client, @sqsUrlResolver) ->
		@cache = new Map

	send: ({ service, name, payload, delay = 0 }) ->
		queueName = if name then "#{service}__#{name}" else service
		queueUrl  = await @sqsUrlResolver.fromName queueName

		return @client.sendMessage {
			QueueUrl: 		queueUrl
			MessageBody: 	JSON.stringify payload
			DelaySeconds: 	delay

			MessageAttributes: {
				'queue': {
					DataType:		'String'
					StringValue:	queueName
				}
			}
		}
		.promise()

	batch: ({ service, name, payloads = [], delay = 0 }) ->
		queueName = if name then "#{service}__#{name}" else service
		queueUrl  = await @sqsUrlResolver.fromName queueName

		entries = payloads.map (payload, index) ->
			return {
				Id: 			String index
				MessageBody: 	JSON.stringify payload
				DelaySeconds: 	delay

				MessageAttributes: {
					'queue': {
						DataType:	 	'String'
						StringValue: 	queueName
					}
				}
			}

		chunks = @chunk entries

		return Promise.all chunks.map (entries) =>
			return @client.sendMessageBatch {
				QueueUrl: 	queueUrl
				Entries: 	entries
			}
			.promise()

	chunk: (entries, size = 10) ->
		chunks = []
		while entries.length > 0
			chunks.push entries.splice 0, size

		return chunks


export class SqsUrlResolver

	constructor: (@client) ->
		@urls 		= new Map
		@promises 	= new Map

	fromName: (name) ->
		if @urls.has name
			return @urls.get name

		if @promises.has name
			{ QueueUrl } = await @promises.get name
			return QueueUrl

		promise = @client.getQueueUrl { QueueName: name }
			.promise()

		@promises.set name, promise
		{ QueueUrl } = await promise

		@urls.set name, QueueUrl

		return QueueUrl
