
import IotClient from 'aws-sdk/clients/iot'
import IotDataClient from 'aws-sdk/clients/iotdata'

interface Publish {
	topic: string
	id?: string | number
	event: string
	value?: any
	qos: 0 | 1 | 2
}

interface Payload {
	i?: string | number
	e: string
	v: any
}

export class Iot {
	private client: IotDataClient
	private endpoint?: string

	constructor(endpoint) {
		this.endpoint = endpoint
	}

	private async getEndpoint(): Promise<string> {
		if (this.endpoint) {
			return this.endpoint
		}

		const client = new IotClient({ apiVersion: '2015-05-28' })
		const response = await client.describeEndpoint({ endpointType: 'iot:Data' }).promise()

		if (!response.endpointAddress) {
			throw new Error('No iot endpoint found')
		}

		return response.endpointAddress
	}

	private async getClient(): Promise<IotDataClient> {
		if (!this.client) {
			this.client = new IotDataClient({
				endpoint: await this.getEndpoint(),
				apiVersion: '2015-05-28'
			})
		}

		return this.client
	}

	async publish({ topic, id, event, value, qos = 0 }: Publish) {
		const payload: Payload = {
			e: event,
			v: value
		}

		if (id) {
			payload.i = id
		}

		const client = await this.getClient()
		await client.publish({
			qos,
			topic,
			payload: JSON.stringify(payload)
		}).promise()

		return this
	}
}
