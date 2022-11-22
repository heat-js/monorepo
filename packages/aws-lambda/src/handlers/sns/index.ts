import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { IApp } from '../../app'
import { Next } from '../../compose'
import { serviceName } from '../../helper'

export const sns = () => {
	return (app: IApp, next: Next) => {
		app.$.sns = () => {
			const region = process.env.AWS_REGION
			const account = process.env.AWS_ACCOUNT_ID
			const client = new SNSClient({ region, apiVersion: '2016-11-23' })

			return new SNS(client, region, account)
		}

		return next()
	}
}

interface Publish {
	service?: string
	topic: string
	subject?: string
	payload: object
	attributes: { [key: string]: string }
}

export class SNS {
	private client: SNSClient
	private region: string
	private accountId: string

	constructor(client, region, accountId) {
		this.client = client
		this.region = region
		this.accountId = accountId
	}

	private formatMessageAttributes(attributes) {
		const object = {}
		Object.entries(attributes).forEach(([key, value]) => {
			object[key] = {
				DataType: 'String',
				StringValue: value
			}
		})

		return object
	}

	publish({ service, topic, subject, payload, attributes = {} }: Publish) {
		const snsTopic = serviceName(service, topic)
		const command = new PublishCommand({
			TopicArn: `arn:aws:sns:${this.region}:${this.accountId}:${snsTopic}`,
			Subject: subject,
			Message: JSON.stringify(payload),
			MessageAttributes: this.formatMessageAttributes({
				topic: snsTopic,
				...attributes
			})
		})

		return this.client.send(command)
	}
}
