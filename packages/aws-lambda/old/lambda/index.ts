
import { LambdaClient, LambdaClientConfig } from '@aws-sdk/client-lambda'
import { Next, Request } from '../../types.js'

export const lambda = (config:LambdaClientConfig = {}) => {
	return ({ $ }: Request, next: Next) => {
		$.lambda = () => {
			return new LambdaClient(config)
		}

		return next()
	}
}
