
import { describe, it } from 'vitest'
import { startDynamoDB } from '../src'

describe('DynamoDB', () => {

	const dynamo = startDynamoDB({
		path: './test/dynamodb.yml'
	})

	it('should ping the server', async () => {
		await dynamo.ping()
	})

	// it('should provide a client', async () => {
	// 	const client = dynamo.getClient()
	// 	const command = new DescribeTableCommand({
	// 		TableName: 'test'
	// 	})

	// 	await client.send(command)
	// })

})
