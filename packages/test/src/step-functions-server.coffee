
import fs					from 'fs'
import crypto				from 'crypto'
import querystring 			from 'querystring'
import AWS					from 'aws-sdk'
import YAML					from 'js-yaml'
import aslValidator			from 'asl-validator'
import Koa 					from 'koa'
import stepFunctionsLocal	from '@heat/step-functions-local'

export start = (mocks, params = {}) ->

	if not mocks
		throw Error 'Step Functions Local cannot run without mocks'

	params = Object.assign {
		accountId:	'012345678999'
		region: 	'eu-west-1'
		timeout: 	15 * 1000
		lambdaPort:	3001
		sqsPort:	3002
		snsPort:	3003
	}, params

	# ---------------------------------------------------------
	# Create Step Functions client

	clientOptions = {
		apiVersion: 		'2016-11-23'
		endpoint: 			'http://localhost:8083'
		region: 			params.region
		sslEnabled:			false
		accessKeyId:		'fake'
		secretAccessKey:	'fake'
	}

	client = new AWS.StepFunctions clientOptions

	# ---------------------------------------------------------
	# Get and validate resources for definening the state machines

	stateMachines = []
	lambdaToMock  = {}

	createStateMachine = (name, path) ->
		yaml      = fs.readFileSync path
		resources = await YAML.load yaml

		if resources.definition
			resources = { resources }

		for stateMachineName, resource of resources
			definition = resource.definition
			for stateName, state of definition.States
				if state.Type is 'Task' and state.Resource.indexOf('arn:aws:states:::sqs:sendMessage') > -1
					state.Parameters.QueueUrl = "http://localhost:#{params.sqsPort}"
					delete state.Parameters.MessageAttributes
				else if state.Type is 'Task' and state.Resource.indexOf('arn:aws:lambda') > -1
					state.Resource = [
						'arn'
						'aws'
						'lambda'
						params.region
						params.accountId
						'function'
						crypto.randomBytes(16).toString 'hex'
					].join ':'

				else if state.Resource is 'arn:aws:states:::lambda:invoke.waitForTaskToken'
					state.Parameters.FunctionName = [
						'arn'
						'aws'
						'lambda'
						params.region
						params.accountId
						'function'
						crypto.randomBytes(16).toString 'hex'
					].join ':'
			break

		# ---------------------------------------------------------
		# Set mocks to lambda

		for stateName, state of definition.States
			if mocks[stateName]?
				if state.Resource is 'arn:aws:states:::lambda:invoke.waitForTaskToken'
					arnParts 	= state.Parameters.FunctionName.split ':'
					lambdaName 	= arnParts[6]
				else
					arnParts 	= state.Resource.split ':'
					lambdaName 	= arnParts[6]

				lambdaToMock[lambdaName] = mocks[stateName]

		return client.createStateMachine {
			name
			definition: JSON.stringify definition
			roleArn: 	"arn:aws:iam::#{params.accountId}:role/DummyRole"
		}
		.promise()

	# ---------------------------------------------------------
	# Set variables for usage in the before and after callback

	stepFunctionsProcess = null
	lambdaWebServer 	 = null
	sqsWebServer 		 = null
	snsWebServer 		 = null

	beforeAll ->
		# ---------------------------------------------------------
		# Spawn the local step functions server

		stepFunctionsProcess = await stepFunctionsLocal.spawn {
			accountId:		params.accountId
			region: 		params.region
			lambdaEndpoint: "http://localhost:#{params.lambdaPort}"
			sqsEndpoint: 	"http://localhost:#{params.sqsPort}"
			snsEndpoint: 	"http://localhost:#{params.snsPort}"
		}

		# console.log stepFunctionsProcess.spawnargs

		stepFunctionsProcess.stdout.on 'data', (data) ->
			return

		# ---------------------------------------------------------
		# Ping for the server to respond before proceeding

		while true
			try
				await client.listStateMachines().promise()
			catch error
				await new Promise (resolve) ->
					setTimeout resolve, 100
				continue
			break

		# ---------------------------------------------------------
		# Create the state machines

		await Promise.all stateMachines.map (stateMachine) ->
			return createStateMachine(
				stateMachine.name
				stateMachine.path
			)

		# ---------------------------------------------------------
		# Start webservers to intercept mocked lambda's

		lambdaWebServer = startWebServer params.lambdaPort, (ctx) ->
			urlParts 	= ctx.request.url.split '/'
			lambdaName 	= urlParts[3]

			body = JSON.parse ctx.request.body

			if mock = lambdaToMock[lambdaName]
				try
					response 	= mock body
					ctx.status 	= 200
				catch error
					response 	= error
					ctx.status 	= 500

				ctx.body = JSON.stringify response
			else
				ctx.body = JSON.stringify ''

		sqsWebServer = startWebServer params.sqsPort, (ctx) ->
			message    	= querystring.decode ctx.request.body
			messageBody = message.MessageBody
			messageMd5 	= crypto.createHash('md5').update(messageBody).digest 'hex'

			xml = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>
					<SendMessageResponse>
						<SendMessageResult>
							<MD5OfMessageBody>#{messageMd5}</MD5OfMessageBody>
							<MessageId>#{ctx.headers['amz-sdk-invocation-id']}</MessageId>
						</SendMessageResult>
					</SendMessageResponse>"

			ctx.status 	= 200
			ctx.body 	= xml

		snsWebServer = startWebServer params.snsPort, (ctx) ->
			ctx.status 	= 200
			ctx.body 	= null
	, params.timeout

	afterAll ->
		stepFunctionsProcess.kill()
		lambdaWebServer.close()
		sqsWebServer.close()
		snsWebServer.close()
	, params.timeout

	# ---------------------------------------------------------
	# Return client and execution helper

	return {
		create: (name, path) ->
			stateMachines.push { name, path }
			return "arn:aws:states:#{params.region}:#{params.accountId}:stateMachine:#{name}"
		client: ->
			return new AWS.StepFunctions clientOptions
		stateMachines: stateMachines.reduce (total, stateMachine) ->
			total[stateMachine.alias] = {
				arn: 	stateMachine.arn
				name:	stateMachine.name
			}
			return total
		, {}
		awaitExecution: (executionArn) ->
			while true
				result = await client.describeExecution {
					executionArn
				}
				.promise()

				if result.status is 'RUNNING'
					await new Promise (resolve) ->
						setTimeout resolve, 100
					continue
				break

			return result
	}


startWebServer = (port, middleware) ->
	app = new Koa()
	app.use (ctx, next) ->
		body = await new Promise (resolve) ->
			body = []
			ctx.req.on 'data', (chunk) ->
				body.push chunk

			ctx.req.on 'end', (data) ->
				body = Buffer.concat(body).toString()
				resolve body
		ctx.request.body = body
		await next()
	app.use middleware
	return app.listen port
