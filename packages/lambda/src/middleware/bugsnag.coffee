
import Bugsnag 		 from '@bugsnag/js'
import inFlight 	 from '@bugsnag/in-flight'
import Middleware 	 from './abstract'
import ViewableError from '../error/viewable-error'

export default class BugsnagMiddleware extends Middleware

	constructor: (@apiKey) ->
		super()

	getApiKey: (app) ->
		key = (
			@apiKey or
			(
				app.has('config') and
				app.config.bugsnag and
				app.config.bugsnag.apiKey
			) or
			process.env.BUGSNAG_API_KEY
		)

		if @testingEnv()
			return @apiKey or 'test'

		if not key
			throw new Error 'Bugsnag API key not found'

		if typeof key isnt 'string'
			throw new Error 'Bugsnag API key should be a string'

		if -1 < key.indexOf 'ssm:/'
			throw new Error 'SSM Bugsnag API key is invalid'

		return key

	testingEnv: ->
		return !!(
			process.env.JEST_WORKER_ID or
			process.env.TESTING
		)

	setupTimeoutError: (app) ->
		if @testingEnv()
			return

		delay = app.context.getRemainingTimeInMillis() - 1000

		return setTimeout ->
			remaining = app.context.getRemainingTimeInMillis()
			app.log new Error "Lambda will timeout in #{remaining}ms"
		, delay

	initBugsnag: (app) ->
		if not @bugsnag
			@bugsnag = Bugsnag.createClient {
				apiKey: @getApiKey app
				autoTrackSessions: false
				logger: null
			}

			inFlight.trackInFlight @bugsnag

		return @bugsnag

	handle: (app, next) ->

		app.value 'bugsnag', @initBugsnag app

		app.value 'log', (error, metaData = {}) =>
			return @log(
				error
				app.context
				app.input
				metaData
			)

		app.value 'errorWrapper', (fn) ->
			return (...args) ->
				try
					await fn.apply null, args

				catch error
					if not ( error instanceof ViewableError )
						await app.log error

					throw error

		timeout = @setupTimeoutError app

		try
			await app.errorWrapper(next)()

		catch error
			throw error

		finally
			clearTimeout timeout

	log: (error, context = {}, input = {}, metaData = {}) ->

		if @testingEnv()
			return

		console.error error

		@bugsnag.notify error, (event) ->
			event.addMetadata 'errorData', error.metadata
			event.addMetadata 'metaData', metaData
			event.addMetadata 'input', input
			event.addMetadata 'lambda', {
				requestId: 			context.awsRequestId
				functionName: 		context.functionName
				functionVersion:	context.functionVersion
				memoryLimitInMB:	context.memoryLimitInMB
			}

		await inFlight.flush 3000
