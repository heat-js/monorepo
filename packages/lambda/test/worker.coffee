
import handle 	from '../src/handle'
import Worker 	from '../src/middleware/worker'

lambda = handle(
	new Worker
	(app) ->
		output = app.records.map (record) ->
			return record.payload

		app.output = output
)

describe 'Test Worker Middleware', ->

	sqsMessages = {
		Records: [
			{
				messageId: 		'059f36b4-87a3-44ab-83d2-661975830a7d'
				body: 			JSON.stringify 'sqsPayload'
				attributes:		{ SentTimestamp: '1545082649183' }
				eventSourceARN: 'arn:aws:sqs:us-east-2:123456789012:my-queue'
				messageAttributes: {
					queue: {
						dataType: 'String'
						stringValue: 'sqs__queue'
					}
				}
			}
		]
	}

	snsMessage = {
		Records: [
			{
				EventSource: 'aws:sns',
				EventVersion: '1.0',
				EventSubscriptionArn: 'arn:aws:sns:eu-west-1:123456789:lambda:7fa92437-7910-4453-b5db-69cbc8aecf5b',
				Sns: {
					Type: 'Notification',
					MessageId: 'f553fe9c-306b-5be2-ab89-a9ea5aea2afc',
					Timestamp: '2019-01-02T12:45:07.000Z',
					TopicArn: 'arn:aws:sns:eu-west-1:519177113932:betting__bet',
					Subject: null,
					Message: JSON.stringify { userId: 123 }
					MessageAttributes: {
						snsTopic: {
							Type: 'String',
							Value: 'betting__bet'
						}
					}
				}
			}
		]
	}

	it 'should able to parse plain objects', ->
		input = [ {}, {} ]
		expect await lambda input
			.toStrictEqual input

	it 'should able to parse SQS messages', ->
		expect await lambda sqsMessages
			.toStrictEqual [ 'sqsPayload' ]

	it 'should able to parse SNS messages', ->
		expect await lambda snsMessage
			.toStrictEqual [{ userId: 123 }]
