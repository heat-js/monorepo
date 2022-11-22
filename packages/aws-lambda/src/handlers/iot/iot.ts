import { IoTClient, DescribeEndpointCommand } from '@aws-sdk/client-iot'
import { IoTDataPlaneClient, PublishCommand } from '@aws-sdk/client-iot-data-plane'

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
	private client: IoTDataPlaneClient
	private endpoint?: string

	constructor(endpoint) {
		this.endpoint = endpoint
	}

	private async getEndpoint(): Promise<string> {
		if (this.endpoint) {
			return this.endpoint
		}

		const command = new DescribeEndpointCommand({
			endpointType: 'iot:Data'
		})
		const client = new IoTClient({ apiVersion: '2015-05-28' })
		const response = await client.send(command)

		if (!response.endpointAddress) {
			throw new Error('No iot endpoint found')
		}

		return response.endpointAddress
	}

	private async getClient(): Promise<IoTDataPlaneClient> {
		if (!this.client) {
			this.client = new IoTDataPlaneClient({
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
		const command = new PublishCommand({
			qos,
			topic,
			payload: Buffer.from(JSON.stringify(payload))
		})

		return client.send(command)
	}
}
