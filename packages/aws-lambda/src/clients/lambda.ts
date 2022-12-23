
import { LambdaClient, LambdaClientConfig } from '@aws-sdk/client-lambda'
import { cachedClient } from '../helper.js'

export const getLambdaClient = cachedClient<LambdaClient, LambdaClientConfig>(async (config) => {
	return new LambdaClient(config)
})
