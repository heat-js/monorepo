
import { start } from '../../src/dynamodb/index'

describe 'DynamoDB stream', ->

	listener = jest.fn()

	dynamo = start {
		path: './test/data/dynamodb.yml'
		stream: {
			test: listener
		}
	}

	client = dynamo.documentClient()

	it 'should stream for put requests', ->
		await client.put {
			TableName: 'test'
			Item: {
				id: 'test'
			}
		}
		.promise()

		expect listener
			.toHaveBeenCalledTimes 1

	it 'should stream for update requests', ->
		await client.update {
			TableName: 'test'
			Key: { id: 'test' }
			UpdateExpression: 'set #field = :value'
			ExpressionAttributeNames:
				'#field': 'field'
			ExpressionAttributeValues:
				':value': 'value'
		}
		.promise()

		expect listener
			.toHaveBeenCalledTimes 2

	it 'should stream for delete requests', ->
		await client.delete {
			TableName: 'test'
			Key: { id: 'test' }
		}
		.promise()

		expect listener
			.toHaveBeenCalledTimes 3

	it 'should stream for transactWrite requests', ->
		await client.transactWrite {
			TransactItems: [
				{
					Put:
						TableName: 'test'
						Item:
							id: 'test-1'
				}
				{
					Put:
						TableName: 'test'
						Item:
							id: 'test-2'
				}
			]
		}
		.promise()

		expect listener
			.toHaveBeenCalledTimes 5

		await client.transactWrite {
			TransactItems: [
				{
					Delete:
						TableName: 'test'
						Key:
							id: 'test-1'
				}
				{
					Delete:
						TableName: 'test'
						Key:
							id: 'test-2'
				}
			]
		}
		.promise()

		expect listener
			.toHaveBeenCalledTimes 7

	it 'should stream for batchWrite requests', ->
		await client.batchWrite {
			RequestItems: {
				test: [
					{
						PutRequest:
							Item:
								id: 'test-1'
					}
					{
						PutRequest:
							Item:
								id: 'test-2'
					}
				]
			}
		}
		.promise()

		expect listener
			.toHaveBeenCalledTimes 9

		await client.batchWrite {
			RequestItems: {
				test: [
					{
						DeleteRequest:
							Key:
								id: 'test-1'
					}
					{
						DeleteRequest:
							Key:
								id: 'test-2'
					}
				]
			}
		}
		.promise()

		expect listener
			.toHaveBeenCalledTimes 11
