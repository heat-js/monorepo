
import path 	 from 'path'
import { start } from '../src/step-functions-server'

jest.setTimeout 15000

describe 'Test Step Functions Server with Mocks', ->

	taskToken = null

	mocks = {
		WaitForTaskToken: jest.fn (input) ->
			taskToken = input.taskToken
			return taskToken
		Lambda: jest.fn().mockReturnValue 'somevalue'
	}

	stepFunctions = start mocks

	stateMachineArn = stepFunctions.create(
		'TestStepFunction'
		path.join __dirname, './data/step-functions.yml'
	)

	client = stepFunctions.client()

	it 'should list all the created state machines', ->
		result = await client.listStateMachines().promise()

		expect result.stateMachines.length
			.toBe 1

		expect result.nextToken
			.toBe null

	it 'should start and describe an execution', ->
		result = await client.startExecution {
			stateMachineArn
			input: JSON.stringify {
				address: 'address123'
			}
		}
		.promise()

		expect result.executionArn
			.toBeDefined()

		# ---------------------------------------------------------
		# The execution will be waiting for a callback

		await new Promise (resolve) ->
			setTimeout resolve, 2000

		execution = await client.describeExecution {
			executionArn: result.executionArn
		}
		.promise()

		expect execution.status
			.toBe 'RUNNING'

		expect execution.stopDate
			.toBe null

		# ---------------------------------------------------------
		# Send a succesfull callback response to the execution

		await client.sendTaskSuccess {
			taskToken
			output: JSON.stringify {}
		}
		.promise()

		# ---------------------------------------------------------
		# The execution will start running again and will be completed

		await stepFunctions.awaitExecution result.executionArn

		execution = await client.describeExecution {
			executionArn: result.executionArn
		}
		.promise()

		expect execution.status
			.toBe 'SUCCEEDED'

		expect JSON.parse execution.output
			.toEqual {
				address: 'address123'
				output:	 'somevalue'
			}

		history = await client.getExecutionHistory {
			executionArn: 	result.executionArn
			maxResults:		1000
		}
		.promise()

		expect Array.isArray history.events
			.toBe true

		expect mocks.Lambda
			.toHaveBeenCalled()
