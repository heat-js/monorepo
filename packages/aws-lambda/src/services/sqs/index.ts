
import { serviceName } from '../../helper.js'
import { SQSClient, SendMessageCommand, GetQueueUrlCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs'
import chunk from 'chunk'

interface SendMessage {
	service?: string
	name: string
	payload?: any
	delay?: number
}

interface BatchSendMessage {
	service?: string
	name: string
	items: BatchItem[]
}

interface BatchItem {
	payload?: any
	delay?: number
}

export const getQueueUrl = async (client: SQSClient, queue:string) => {
	const command = new GetQueueUrlCommand({ QueueName: queue })
	const response = await client.send(command)

	return response.QueueUrl
}

const cache = new Map()

export const getCachedQueueUrl = async (client: SQSClient, queue:string) => {
	if(cache.has(queue)) {
		cache.set(queue, getQueueUrl(client, queue))
	}

	return cache.get(queue)
}

export const sendMessage = async (client: SQSClient, { service, name, payload, delay = 0 }: SendMessage) => {
	const queue = serviceName(service, name)
	const command = new SendMessageCommand({
		QueueUrl: await getCachedQueueUrl(client, queue),
		MessageBody: JSON.stringify(payload),
		DelaySeconds: delay,
		MessageAttributes: {
			queue: {
				DataType: 'String',
				StringValue: queue
			}
		}
	})

	return client.send(command)
}

export const batchSendMessage = async (client: SQSClient, { service, name, items }: BatchSendMessage) => {
	const queue = serviceName(service, name)
	const url = await getCachedQueueUrl(client, queue)

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
						StringValue: queue
					}
				}
			}))
		})

		return client.send(command)
	}))
}
