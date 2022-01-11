
import { start } 	from '../../src/dynamodb/index'
import AWS 			from 'aws-sdk'

describe 'Test DynamoDB server', ->

	dynamo = start {
		path: './test/data/dynamodb-awsless.yml'
	}

	it 'should be able to connect and store an item in dynamo', ->
		client = dynamo.documentClient()
		await client.put {
			TableName: 'test'
			Item: {
				id: 'test'
			}
		}
		.promise()
