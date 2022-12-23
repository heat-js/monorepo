
import { IoTClient, DescribeEndpointCommand } from '@aws-sdk/client-iot'
import { IoTDataPlaneClient, IoTDataPlaneClientConfig } from '@aws-sdk/client-iot-data-plane'
import { cachedClient } from '../helper.js'

export const getIoTClient = cachedClient<IoTDataPlaneClient, IoTDataPlaneClientConfig>(async (config) => {
	return new IoTDataPlaneClient({
		...config,
		endpoint: config.endpoint || process.env.IOT_ENDPOINT || await getIoTEndpoint(),
	})
})

const getIoTEndpoint = async (): Promise<string> => {
	const command = new DescribeEndpointCommand({ endpointType: 'iot:Data' })
	const client = new IoTClient({ apiVersion: '2015-05-28' })
	const response = await client.send(command)

	if (!response.endpointAddress) {
		throw new Error('No iot endpoint found')
	}

	return response.endpointAddress
}
