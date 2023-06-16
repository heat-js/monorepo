
import AWS				from 'aws-sdk'
import { DynamoDBServer } 		from '@awsless/dynamodb-server'

export default class Server

	constructor: (@region = 'eu-west-1') ->
		@dynamos	= []
		@clients	= []
		@port		= 80

	listen: (@port) ->
		endpoint = new AWS.Endpoint "http://localhost:#{ @port }"

		for dynamo in @dynamos
			dynamo.config.endpoint = "http://localhost:#{ @port }"
			dynamo.endpoint = endpoint

		for client in @clients
			client.service.config.endpoint = "http://localhost:#{ @port }"
			client.service.endpoint = endpoint

		server = new DynamoDBServer()
		@process = server

		await server.listen @port

		# @process = await dynamoDbLocal.spawn {
		# 	port: @port
		# }

	destroy: ->
		if @process
			await @process.kill()

	dynamodb: ->
		instance = new AWS.DynamoDB {
			apiVersion: 		'2016-11-23'
			endpoint: 			"http://localhost:#{ @port or 80 }"
			region: 			@region
			sslEnabled:			false
			accessKeyId:		'fake'
			secretAccessKey:	'fake'
		}

		@dynamos.push instance

		return instance

	documentClient: ->
		client = new AWS.DynamoDB.DocumentClient {
			service: @dynamodb()
		}

		@clients.push client

		return client
