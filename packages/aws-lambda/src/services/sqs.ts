
import { serviceName } from '../helper.js'
import { SQSClient, SendMessageCommand, GetQueueUrlCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs'
// import { LambdaFunction } from '../../handle.js'
import chunk from 'chunk'
import { getSQSClient } from '../clients/sqs.js'

type Attributes = {
	[ key:string ]: string
}

type FormattedAttributes = {
	[ key:string ]: {
		DataType: 'String'
		StringValue: string
	}
}

// interface AddQueueMessage<Lambda extends LambdaFunction> {
interface AddQueueMessage {
	client?: SQSClient
	service?: string
	name: string
	// payload?: Parameters<Lambda>[0]
	payload?: any
	delay?: number
	attributes?: Attributes
}

interface AddQueueBatch {
	client?: SQSClient
	service?: string
	name: string
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

export const addQueueMessage = async ({ client, service, name, payload, delay = 0, attributes = {} }: AddQueueMessage) => {
	const sqsClient = client || await getSQSClient({})
	const queue = serviceName(service, name)
	const url = await getCachedQueueUrl(sqsClient, queue)

	const command = new SendMessageCommand({
		QueueUrl: url,
		MessageBody: JSON.stringify(payload),
		DelaySeconds: delay,
		MessageAttributes: formatAttributes({ queue, ...attributes })
	})

	return sqsClient.send(command)
}

export const addQueueBatch = async ({ client, service, name, items }: AddQueueBatch) => {
	const sqsClient = client || await getSQSClient({})
	const queue = serviceName(service, name)
	const url = await getCachedQueueUrl(sqsClient, queue)

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

		return sqsClient.send(command)
	}))
}
