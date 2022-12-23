
import { SSMClient, SSMClientConfig } from '@aws-sdk/client-ssm'
import { cachedClient } from '../helper.js'

export const getSSMClient = cachedClient<SSMClient, SSMClientConfig>(async (config) => {
	return new SSMClient(config)
})
