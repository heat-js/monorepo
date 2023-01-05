
import { SQSClient, SendMessageCommand, GetQueueUrlCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs'
import { sqsClient } from '@heat/aws-clients'
import chunk from 'chunk'

type Attributes = {
	[ key:string ]: string
}

type FormattedAttributes = {
	[ key:string ]: {
		DataType: 'String'
		StringValue: string
	}
}

interface AddQueueMessage {
	client?: SQSClient
	queue: string
	payload?: any
	delay?: number
	attributes?: Attributes
}

interface AddQueueBatch {
	client?: SQSClient
	queue: string
	items: BatchItem[]
}

interface BatchItem {
	payload?: any
	delay?: number
	attributes?: Attributes
}

const formatAttributes = (attributes:Attributes) => {
	const list:FormattedAttributes = {}
	for(let key in attributes) {
		list[key] = {
			DataType: 'String',
			StringValue: attributes[key]
		}
	}

	return list
}

export const getQueueUrl = async (client: SQSClient, queue:string) => {
	const command = new GetQueueUrlCommand({ QueueName: queue })
	const response = await client.send(command)

	return response.QueueUrl
}

const cache = new Map()

export const getCachedQueueUrl = (client: SQSClient, queue:string) => {
	if(!cache.has(queue)) {
		cache.set(queue, getQueueUrl(client, queue))
	}

	return cache.get(queue)
}

/** Add message to a SQS queue */
export const addQueueMessage = async ({ client = sqsClient.get(), queue, payload, delay = 0, attributes = {} }: AddQueueMessage) => {
	const url = await getCachedQueueUrl(client, queue)

	const command = new SendMessageCommand({
		QueueUrl: url,
		MessageBody: JSON.stringify(payload),
		DelaySeconds: delay,
		MessageAttributes: formatAttributes({ queue, ...attributes })
	})

	return client.send(command)
}

/** Add batch of messages to a SQS queue */
export const addQueueBatch = async ({ client = sqsClient.get(), queue, items }: AddQueueBatch) => {
	const url = await getCachedQueueUrl(client, queue)

	await Promise.all(chunk(items, 10).map(async batch => {
		const command = new SendMessageBatchCommand({
			QueueUrl: url,
			Entries: items.map(({ payload, delay = 0, attributes = {} }, id) => ({
				Id: String(id),
				MessageBody: JSON.stringify(payload),
				DelaySeconds: delay,
				MessageAttributes: formatAttributes({ queue, ...attributes })
			}))
		})

		return client.send(command)
	}))
}
