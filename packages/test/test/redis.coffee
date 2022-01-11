
import { start } 	from '../src/redis'
import AWS 			from 'aws-sdk'

describe 'Test Redis server', ->

	clients = []
	servers = []
	promises = [ 0...5 ].map (i) ->
		redis = start()
		clients.push redis.client()
		servers.push redis

	it 'should be able to connect and store an item in', ->

		for client in clients
			await new Promise (resolve) ->
				client.SET 'test', 'test', (error) ->
					resolve()

			result = await new Promise (resolve) ->
				client.GET 'test', (error, data) ->
					resolve data

			expect result
				.toBe 'test'

		return
