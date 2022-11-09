
import { IApp } from "../../app"
import { Next } from "../../compose"
import { serviceName } from "../../helper"
import { SQSClient, SendMessageCommand, GetQueueUrlCommand } from "@aws-sdk/client-sqs"

export const sqs = () => {
	const cache = new Map;
	return (app:IApp, next:Next) => {
		app.$.sqs = () => {
			const client = new SQSClient({
				region: process.env.AWS_REGION
			})

			return new SQS(client, cache);
		}

		return next();
	}
}

interface Send {
	service?: string
	name: string
	payload: object
	delay?: number
}

export class SQS {
	private client: SQSClient;
	private cache: Map<string, Promise<string>>;

	constructor(client, cache) {
		this.client = client;
		this.cache = cache;
	}

	private async getQueueUrl(query:string): Promise<string> {
		const command = new GetQueueUrlCommand({ QueueName: query });
		const response = await this.client.send(command);

		return response.QueueUrl;
	}

	private getCachedQueueUrl(query:string): Promise<string> {
		const promise = this.cache[query];
		if(!promise) {
			return this.cache[query] = this.getQueueUrl(query);
		}

		return promise;
	}

	async send ({ service, name, payload, delay = 0 }: Send) {
		const query = serviceName(service, name);
		const command = new SendMessageCommand({
			QueueUrl: await this.getCachedQueueUrl(query),
			MessageBody: JSON.stringify(payload),
			DelaySeconds: delay,
			MessageAttributes: {
				queue: {
					DataType: 'String',
					StringValue: query
				}
			}
		})

		return this.client.send(command);
	}
}



	// batch: ({ service, name, payloads = [], delay = 0 }) ->
	// 	queueName = if name then "#{service}__#{name}" else service
	// 	queueUrl  = await @sqsUrlResolver.fromName queueName

	// 	entries = payloads.map (payload, index) ->
	// 		return {
	// 			Id: 			String index
	// 			MessageBody: 	JSON.stringify payload
	// 			DelaySeconds: 	delay

	// 			MessageAttributes: {
	// 				'queue': {
	// 					DataType:	 	'String'
	// 					StringValue: 	queueName
	// 				}
	// 			}
	// 		}

	// 	chunks = @chunk entries

	// 	return Promise.all chunks.map (entries) =>
	// 		return @client.sendMessageBatch {
	// 			QueueUrl: 	queueUrl
	// 			Entries: 	entries
	// 		}
	// 		.promise()

	// chunk: (entries, size = 10) ->
	// 	chunks = []
	// 	while entries.length > 0
	// 		chunks.push entries.splice 0, size

	// 	return chunks
