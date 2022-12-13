
import { IoTClient, DescribeEndpointCommand } from '@aws-sdk/client-iot'
import { IoTDataPlaneClient, IoTDataPlaneClientConfig } from '@aws-sdk/client-iot-data-plane'
import { test } from '../../helper.js'
import { Next, Request } from '../../types.js'

export const iot = (config: IoTDataPlaneClientConfig = {}) => {
	let cachedEndpoint = config.endpoint || process.env.IOT_ENDPOINT

	return async ({ $ }:Request, next:Next) => {
		if(!cachedEndpoint && !test()) {
			cachedEndpoint = await getIotEndpoint()
		}

		$.iot = () => {
			return new IoTDataPlaneClient({
				...config,
				endpoint: cachedEndpoint,
			})
		}

		return next()
	}
}

const getIotEndpoint = async (): Promise<string> => {
	const command = new DescribeEndpointCommand({ endpointType: 'iot:Data' })
	const client = new IoTClient({ apiVersion: '2015-05-28' })
	const response = await client.send(command)

	if (!response.endpointAddress) {
		throw new Error('No iot endpoint found')
	}

	return response.endpointAddress
}
