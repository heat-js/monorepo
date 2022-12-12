
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs'
import { Next, Request } from '../../types'

export const sqs = (config:SQSClientConfig = {}) => {
	return ({ $ }:Request, next: Next) => {
		$.sqs = () => {
			return new SQSClient(config)
		}

		return next()
	}
}
