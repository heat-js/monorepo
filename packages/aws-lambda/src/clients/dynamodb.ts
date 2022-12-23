
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { cachedClient } from '../helper.js'

export const getDynamoDBClient = cachedClient<DynamoDBDocumentClient, DynamoDBClientConfig>(async (config) => {
	const client = new DynamoDBClient(config)
	return DynamoDBDocumentClient.from(client)
})
