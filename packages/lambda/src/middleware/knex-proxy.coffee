
import Middleware 	from './abstract'
import Signer		from 'aws-sdk/lib/rds/signer'
import knex 		from 'knex'

export default class KnexProxy extends Middleware

	region: (app) ->
		return (
			app.has('config') and
			app.config.aws and
			app.config.aws.region
		) or (
			process.env.AWS_REGION
		) or (
			'eu-west-1'
		)

	handle: (app, next) ->
		db = null
		app.knex = ->
			config = Object.assign {}, app.config.knex, {
				connection: @iamProxyConnectionConfig app.config.knex.connection
			}

			db = knex config
			return db

		try
			await next()

		catch error
			await @destroy db
			throw error

		await @destroy db

	destroy: (db) ->
		if db
			await db.destroy()

	iamProxyConnectionConfig: (connection) ->
		signer = new Signer {
			region: 	@region()
			hostname: 	connection.host
			port: 		connection.port
			username: 	connection.username
		}

		token = signer.getAuthToken {
			username: connection.username
		}

		return {
			host: 		connection.host
			port: 		connection.port
			user: 		connection.username
			password: 	token
			database: 	connection.database
			ssl: 		{ rejectUnauthorized: false }

			authSwitchHandler: ({ pluginName, pluginData }, cb) ->
				if pluginName is 'mysql_clear_password'
					password =  token + '\0'
					buffer = Buffer.from password
					cb null, password
		}
