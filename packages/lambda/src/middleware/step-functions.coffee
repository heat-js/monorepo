
import Middleware 		from './abstract'
import AwsStepFunctions from 'aws-sdk/clients/stepfunctions'

export default class StepFunctionsMiddleware extends Middleware

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

	accountId: (app) ->
		return (
			app.has('config') and
			app.config.aws and
			app.config.aws.accountId
		) or (
			process.env.AWS_ACCOUNT_ID
		)

	handle: (app, next) ->

		app.stepFunctions = =>

			region 		= @region app
			accountId 	= @accountId app

			client = new AwsStepFunctions {
				apiVersion: '2016-11-23'
				region
			}

			return new StepFunctions(
				client
				region
				accountId
			)

		await next()


export class StepFunctions

	constructor: (@client, @region, @accountId) ->

	start: ({ service, name, payload, idempotentKey = null }) ->
		stateMachineName = if name then "#{service}__#{name}" else service

		arn = [
			'arn:aws:states'
			@region
			@accountId
			'stateMachine'
			stateMachineName
		].join ':'

		try
			response = await @client.startExecution {
				stateMachineArn: 	arn
				input: 				JSON.stringify payload
				name: 				idempotentKey
			}
			.promise()

		catch error
			if error.name is 'ExecutionAlreadyExists'
				return

			throw error

		return

	sendTaskSuccess: ({ taskToken, output = {} }) ->
		output = JSON.stringify output

		await @client.sendTaskSuccess {
			taskToken
			output
		}
		.promise()

	sendTaskFailure: ({ taskToken, errorCode, cause }) ->
		await @client.sendTaskFailure {
			taskToken
			error: errorCode
			cause
		}
		.promise()
