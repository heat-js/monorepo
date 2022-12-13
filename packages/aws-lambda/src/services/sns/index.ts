import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { serviceName } from '../../helper.js'

interface Publish {
	service?: string
	topic: string
	subject?: string
	payload?: any
	attributes?: { [key: string]: string }

	region?: string
	accountId?: string
}

const formatMessageAttributes = (attributes:object) => {
	const object:{ [key:string]: { DataType: 'String', StringValue: string } } = {}
	Object.entries(attributes).forEach(([key, value]) => {
		object[key] = {
			DataType: 'String',
			StringValue: value
		}
	})

	return object
}

export const publish = (client: SNSClient, { service, topic: name, subject, payload, attributes = {}, region = process.env.AWS_REGION, accountId = process.env.AWS_ACCOUNT_ID }: Publish) => {
	const topic = serviceName(service, name)
	const command = new PublishCommand({
		TopicArn: `arn:aws:sns:${region}:${accountId}:${topic}`,
		Subject: subject,
		Message: payload ? JSON.stringify(payload) : undefined,
		MessageAttributes: formatMessageAttributes({
			topic,
			...attributes
		})
	})

	return client.send(command)
}
