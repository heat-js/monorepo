
import { Options } from '../types.js'
import { getDynamoDBClient } from '@heat/aws-lambda'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export const send = async (command:any, options:Options) => {
	const client:DynamoDBDocumentClient = options.client || await getDynamoDBClient({})
	return client.send(command)
}
