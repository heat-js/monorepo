
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { cachedClient } from '../helper.js'

export const getSNSClient = cachedClient<SNSClient, SNSClientConfig>(async (config) => {
	return new SNSClient(config)
})
