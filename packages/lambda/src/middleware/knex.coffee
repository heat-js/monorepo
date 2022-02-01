
import Middleware 	from './abstract'
import AWS			from 'aws-sdk'
import knex 		from 'knex'

export default class Knex extends Middleware

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
		app.knex = =>
			if app.config.knex.proxy
				delete app.config.knex.proxy

				signer = new AWS.RDS.Signer {
					region:		@region app
					hostname: 	app.config.knex.connection.host
					port: 		app.config.knex.connection.port
					username: 	app.config.knex.connection.username
				}

				config = Object.assign {}, app.config.knex, {
					connection: ->
						token = signer.getAuthToken {
							username: app.config.knex.connection.username
						}

						return {
							host: 		app.config.knex.connection.host
							port: 		app.config.knex.connection.port
							user: 		app.config.knex.connection.username
							password: 	token
							database: 	app.config.knex.connection.database
							ssl: 		{ rejectUnauthorized: false }

							authSwitchHandler: ({ pluginName, pluginData }, cb) ->
								if pluginName is 'mysql_clear_password'
									password =  token + '\0'
									buffer = Buffer.from password
									cb null, password
						}
				}
			else
				config = app.config.knex

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

	# iamProxyConnectionConfig: (connection, region) ->
	# 	signer = new AWS.RDS.Signer {
	# 		region
	# 		hostname: 	connection.host
	# 		port: 		connection.port
	# 		username: 	connection.username
	# 	}

	# 	token = signer.getAuthToken {
	# 		username: 	connection.username
	# 	}

	# 	return Object.assign {}, connection, {
	# 		password: 	token
	# 		ssl: 		{ rejectUnauthorized: false }

	# 		authSwitchHandler: ({ pluginName, pluginData }, cb) ->
	# 			if pluginName is 'mysql_clear_password'
	# 				password =  token + '\0'
	# 				buffer = Buffer.from password
	# 				cb null, password
	# 	}
