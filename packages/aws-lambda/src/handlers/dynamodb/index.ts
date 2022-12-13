
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { Next, Request } from '../../types'

export const dynamodb = (config:DynamoDBClientConfig = {}) => {
	return ({ $ }: Request, next: Next) => {

		$.dynamodb = () => {
			const client = new DynamoDBClient(config)
			return DynamoDBDocumentClient.from(client)
		}

		return next()
	}
}
