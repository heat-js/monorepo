import { IApp } from '../../app'
import { Next } from '../../compose'
import { serviceName } from '../../helper'
import { SQSClient, SendMessageCommand, GetQueueUrlCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs'
import { chunk } from 'chunk'

export const sqs = () => {
	const cache = new Map()
	return (app: IApp, next: Next) => {
		app.$.sqs = () => {
			const client = new SQSClient({
				region: process.env.AWS_REGION
			})

			return new SQS(client, cache)
		}

		return next()
	}
}

interface Send {
	service?: string
	name: string
	payload?: any
	delay?: number
}

interface Batch {
	service?: string
	name: string
	items: BatchItem[]
}

interface BatchItem {
	payload?: any
	delay?: number
}

export class SQS {
	private client: SQSClient
	private cache: Map<string, Promise<string>>

	constructor(client, cache) {
		this.client = client
		this.cache = cache
	}

	private async getQueueUrl(query: string): Promise<string> {
		const command = new GetQueueUrlCommand({ QueueName: query })
		const response = await this.client.send(command)

		return response.QueueUrl
	}

	private getCachedQueueUrl(query: string): Promise<string> {
		const promise = this.cache[query]
		if (!promise) {
			return (this.cache[query] = this.getQueueUrl(query))
		}

		return promise
	}

	async send({ service, name, payload, delay = 0 }: Send) {
		const query = serviceName(service, name)
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

		return this.client.send(command)
	}

	async batch({ service, name, items }: Batch) {
		const query = serviceName(service, name)
		const url = await this.getCachedQueueUrl(query)

		await Promise.all(chunk(items, 10).map(async batch => {
			const command = new SendMessageBatchCommand({
				QueueUrl: url,
				Entries: items.map(({ payload, delay = 0 }, id) => ({
					Id: String(id),
					MessageBody: JSON.stringify(payload),
					DelaySeconds: delay,
					MessageAttributes: {
						queue: {
							DataType: 'String',
							StringValue: query
						}
					}
				}))
			})

			return this.client.send(command)
		}))
	}
}
