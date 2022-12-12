
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { Next, Request } from '../../types'

export const dynamodb = () => {
	return ({ $ }: Request, next: Next) => {

		$.dynamodb = () => {
			const client = new DynamoDBClient({ apiVersion: '2012-08-10' })
			return DynamoDBDocumentClient.from(client)
		}

		return next()
	}
}
