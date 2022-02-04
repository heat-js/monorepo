
import handle 	from '../src/handle'
import Knex 	from '../src/middleware/knex'
import Config 	from '../src/middleware/config'

process.env.AWS_REGION = 'eu-west-1'

describe 'Test Knex Middleware', ->

	it 'should return the sqlite client config', ->
		config = {
			client: 'sqlite3'
			useNullAsDefault: true
			connection: {
				filename: ':memory:'
			}
		}

		lambda = handle(
			new Config (env) -> { knex: config }
			new Knex
			(app) ->
				app.output = app.knex.client.config
		)

		expect await lambda()
			.toEqual config

	it 'should return the proxy mysql client config', ->
		config = {
			proxy: true
			client: 'mysql2'
			connection:
				user:		'username'
				host:		'127.0.0.1'
				port:		3306
				database:	'test'
		}

		lambda = handle(
			new Config (env) -> { knex: config }
			new Knex
			(app) ->
				app.output = app.knex.client.config
		)

		result = await lambda()

		expect result
			.toEqual {
				client: 	'mysql2'
				connection: expect.any Function

			}

		expect result.connection()
			.toEqual {
				user: 		'username'
				password: 	'127.0.0.1:3306/'
				host: 		'127.0.0.1'
				port:		3306
				database: 	'test'
				ssl: { rejectUnauthorized: false }
				authSwitchHandler: expect.any Function
			}
