
import { start } 	from '../src/dynamodb/index'
import AWS 			from 'aws-sdk'

describe 'Test DynamoDB server', ->

	clients = []
	servers = []
	promises = [ 1..3 ].map (i) ->
		dynamo = start {
			path: './test/data/dynamodb.yml'
		}
		clients.push dynamo.documentClient()
		servers.push dynamo

	it 'should be able to connect and store an item in dynamo', ->
		await clients[0].put {
			TableName: 'test'
			Item: {
				id: 'test'
			}
		}
		.promise()

	it 'should check all spawned dynamodb instances', ->
		ports = []
		servers.map (dynamo) ->
			expect dynamo
				.toHaveProperty 'dynamodb'

			expect dynamo
				.toHaveProperty 'documentClient'

			dynamodb = dynamo.dynamodb()
			client 	 = dynamo.documentClient()
			port 	 = client.service.endpoint.port

			expect dynamodb.endpoint.port
				.toBe port

			expect port
				.not.toBe 80

			expect dynamodb instanceof AWS.DynamoDB
				.toBe true

			expect client instanceof AWS.DynamoDB.DocumentClient
				.toBe true

			expect typeof port
				.toBe 'number'

			ports.push port

		# ---------------------------------------------------------
		# Check if the all instances have a different port

		expect ports.length
			.toBe servers.length

		unique = [...new Set ports]

		expect unique.length
			.toBe ports.length
