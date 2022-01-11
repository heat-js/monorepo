
import Middleware 	 from './abstract'
import bugsnag 		 from '@bugsnag/js'
import ViewableError from '../error/viewable-error'

export default class Bugsnag extends Middleware

	constructor: (@apiKey) ->
		super()

	getApiKey: (app) ->
		return (
			@apiKey or
			(
				app.has('config') and
				app.config.bugsnag and
				app.config.bugsnag.apiKey
			) or
			process.env.BUGSNAG_API_KEY
		)

	testingEnv: ->
		return !!(
			process.env.JEST_WORKER_ID or
			process.env.TESTING
		)

	handle: (app, next) ->

		apiKey = @getApiKey app

		if not apiKey and @testingEnv()
			apiKey = 'dummy-api-key'

		if not apiKey
			throw new Error 'Bugsnag API key not found'

		if typeof apiKey isnt 'string'
			throw new Error 'Bugsnag API key should be a string'

		if -1 < apiKey.indexOf 'ssm:/'
			throw new Error 'SSM Bugsnag API key is invalid'

		if not @bugsnag
			@bugsnag = bugsnag {
				apiKey
				projectRoot: process.cwd()
				packageJSON: process.cwd() + '/package.json'
				logger: null
			}

		app.value 'bugsnag', @bugsnag

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

		await app.errorWrapper(next)()


	log: (error, context = {}, input = {}, metaData = {}) ->

		if @testingEnv()
			return

		console.error error

		params = {
			metaData: Object.assign(
				{}
				metaData
				{
					input
					lambda:
						requestId: 			context.awsRequestId
						functionName: 		context.functionName
						functionVersion:	context.functionVersion
						memoryLimitInMB:	context.memoryLimitInMB
				}
				errorData:
					error.metadata
			)
		}

		return new Promise (resolve, reject) =>
			@bugsnag.notify error, params, (err) ->
				if err
					reject err
				else
					resolve()
