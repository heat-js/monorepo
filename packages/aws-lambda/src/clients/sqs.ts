
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { cachedClient } from '../helper.js'

export const getSQSClient = cachedClient<SQSClient, SQSClientConfig>(async (config) => {
	return new SQSClient(config)
})
