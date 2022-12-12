
import { IoTClient, DescribeEndpointCommand } from '@aws-sdk/client-iot'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { Next, Request } from '../../types'

interface IotOptions {
	endpoint?: string
}

export const iot = ({ endpoint }: IotOptions = {}) => {
	return async ({ $ }:Request, next:Next) => {
		const url = endpoint || process.env.IOT_ENDPOINT || await getIotEndpoint()

		$.iot = () => {
			return new IoTDataPlaneClient({
				endpoint: url,
				apiVersion: '2015-05-28'
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
