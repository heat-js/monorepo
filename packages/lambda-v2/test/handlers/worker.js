
import { handle, worker } from "../../src";

describe('Worker', () => {

	const fn = handle(
		worker(),
		(app) => app.output = app.records.map(({ payload }) => payload)
	);

	it('should expose the input as records', async () => {
		const result = await fn({ entry: true });
		expect(result).toStrictEqual([{ entry: true }]);
	});

	it('should expose the SQS input as records', async () => {
		const result = await fn({
			Records: [{
				messageId: '059f36b4-87a3-44ab-83d2-661975830a7d',
				body: JSON.stringify('payload'),
				attributes: { SentTimestamp: '1545082649183' },
				eventSourceARN: 'arn:aws:sqs:us-east-2:0:my-queue',
				messageAttributes: {
					queue: {
						dataType: 'String',
						stringValue: 'sqs__queue'
					}
				}
			}]
		});

		expect(result).toStrictEqual(['payload']);
	});

	it('should expose the SNS input as records', async () => {
		const result = await fn({
			Records: [{
				EventSource: 'aws:sns',
				EventVersion: '1.0',
				EventSubscriptionArn: 'arn:aws:sns:eu-west-1:0:lambda:7fa92437-7910-4453-b5db-69cbc8aecf5b',
				Sns: {
					Type: 'Notification',
					MessageId: 'f553fe9c-306b-5be2-ab89-a9ea5aea2afc',
					Timestamp: '2019-01-02T12:45:07.000Z',
					TopicArn: 'arn:aws:sns:eu-west-1:0:betting__bet',
					Subject: null,
					Message: JSON.stringify('payload'),
					MessageAttributes: {
						snsTopic: {
							Type: 'String',
							Value: 'betting__bet'
						}
					}
				}
			}]
		});

		expect(result).toStrictEqual(['payload']);
	});

});
