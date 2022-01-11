
import Middleware 	from './abstract'
import redis 		from 'redis'

export default class RedisMiddleware extends Middleware

	constructor: (@options) ->
		super()

	value: (app, configName, envName, defaultValue) ->
		return (
			app.has('config') and
			app.config.redis and
			app.config.redis[configName]
		) or (
			process.env[envName]
		) or (
			defaultValue
		)

	handle: (app, next) ->
		instance = null
		app.redis = =>
			instance = redis.createClient Object.assign {
				host:	@value app, 'host', 'REDIS_HOST',	'127.0.0.1'
				port:	@value app, 'port', 'REDIS_PORT',	6379
				db:		@value app, 'db',	'REDIS_DB',		0

				string_numbers:				true
				socket_keepalive:			false
				socket_initial_delay:		0
				no_ready_check:				true
				retry_unfulfilled_commands:	false

				retry_strategy: (options) ->
					if options.error and options.error.code is 'ECONNREFUSED'
						return new Error 'The redis server refused the connection'

					if options.total_retry_time > ( 1000 * 10 )
						return new Error 'The redis retry time exhausted'

					if options.attempt > 10
						return

					return Math.min options.attempt * 100, 3000

			}, @options

			return instance

		try
			await next()

		catch error
			await @destroy instance
			throw error

		await @destroy instance

	destroy: (client) ->
		if not client
			return

		return new Promise (resolve, reject) ->
			client.quit (error) ->
				if error then reject error
				else resolve()
