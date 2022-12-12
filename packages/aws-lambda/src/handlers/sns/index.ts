
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns'
import { Next, Request } from '../../types'

export const sns = (config:SNSClientConfig = {}) => {
	return ({ $ }:Request, next: Next) => {
		$.sns = () => {
			return new SNSClient(config)
		}

		return next()
	}
}
