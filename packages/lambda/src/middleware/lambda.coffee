
import Middleware 		from './abstract'
import Lambda			from 'aws-sdk/clients/lambda'
import ViewableError 	from '../error/viewable-error'

export default class LambdaMiddleware extends Middleware

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

		app.lambda = =>
			lambda = new Lambda {
				apiVersion: '2015-03-31'
				region: 	@region app
			}

			return new LambdaInvoker lambda

		app.invoke = ->
			return app.lambda.invoke.bind app.lambda

		await next()


export class LambdaInvoker

	constructor: (@client) ->

	invoke: ({ service, name, payload, reflectViewableErrors = true }) ->
		result = await @client.invoke {
			FunctionName: 	"#{service}__#{name}"
			Payload: 		JSON.stringify payload
		}
		.promise()

		response = JSON.parse result.Payload

		if typeof response is 'object' and response isnt null and response.errorMessage
			if reflectViewableErrors and ( response.errorType is 'ViewableError' or 0 is response.errorMessage.indexOf '[viewable] ' )
				error = new ViewableError response.errorMessage
			else
				error = new Error response.errorMessage.replace '[viewable] ', ''

			error.name 		= response.errorType
			error.response 	= response
			error.metadata 	= {
				service: "#{service}__#{name}"
			}
			throw error

		return response

	invokeAsync: ({ service, name, payload }) ->
		return await @client.invokeAsync {
			FunctionName: 	"#{service}__#{name}"
			InvokeArgs: 	JSON.stringify payload
		}
		.promise()
