import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { getSNSClient } from '../clients/sns.js'
import { serviceName } from '../helper.js'

type Attributes = { [key:string]: string }
type FormattedAttributes = {
	[key:string]: {
		DataType: 'String'
		StringValue: string
	}
}

interface Publish {
	client?: SNSClient

	service?: string
	topic: string
	subject?: string
	payload?: any
	attributes?: Attributes

	region?: string
	accountId?: string
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


export const sendNotification = async ({ client, service, topic: name, subject, payload, attributes = {}, region = process.env.AWS_REGION, accountId = process.env.AWS_ACCOUNT_ID }: Publish) => {
	const topic = serviceName(service, name)
	const command = new PublishCommand({
		TopicArn: `arn:aws:sns:${region}:${accountId}:${topic}`,
		Subject: subject,
		Message: payload ? JSON.stringify(payload) : undefined,
		MessageAttributes: formatAttributes({
			topic,
			...attributes
		})
	})

	return (client || await getSNSClient({})).send(command)
}
