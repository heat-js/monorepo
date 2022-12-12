import { IoTDataPlaneClient, PublishCommand } from '@aws-sdk/client-iot-data-plane'

interface PublishOptions {
	topic: string
	id?: string | number
	event: string
	value?: any
	qos?: 0 | 1 | 2
}

interface Payload {
	i?: string | number
	e: string
	v: any
}

export const publish = async (client:IoTDataPlaneClient, { topic, id, event, value, qos = 0 }: PublishOptions) => {
	const payload: Payload = {
		e: event,
		v: value
	}

	if (id) {
		payload.i = id
	}

	const command = new PublishCommand({
		qos,
		topic,
		payload: Buffer.from(JSON.stringify(payload))
	})

	return client.send(command)
}
