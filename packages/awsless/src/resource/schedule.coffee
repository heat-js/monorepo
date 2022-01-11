
import resource from '../feature/resource'

import { Ref, Sub, GetAtt }	from '../feature/cloudformation/fn'

parse = (ctx) ->
	Definition	= ctx.array 'Definition'
	states		= []
	resources	= []

	if not Definition.length
		throw new TypeError 'Schedule Definition should alreast have 1 item'

	# -------------------------------------------------------
	# Parse definition items

	for item, index in Definition
		type = ctx.string "Definition.#{ index }.Type"
		type = type.toLowerCase()

		switch type
			when 'invoke', 'function', 'task', 'lambda'
				task = ctx.string [
					"Definition.#{ index }.Resource"
					"Definition.#{ index }.Task"
					"Definition.#{ index }.Name"
					"Definition.#{ index }.Function"
				]

				resources.push task
				states.push {
					Type:		'Task'
					Resource:	task
					Next:		"State#{ index + 2 }"
					Catch: [ {
						ErrorEquals: [ 'States.ALL' ]
						Next: "State#{ index + 2 }"
					} ]
				}

			when 'delay', 'wait', 'sleep'
				time = ctx.number [
					"Definition.#{ index }.Seconds"
					"Definition.#{ index }.Time"
					"Definition.#{ index }.Delay"
				]

				states.push {
					Type:		'Wait'
					Seconds:	time
					Next:		"State#{ index + 2 }"
				}

	# -------------------------------------------------------
	# Make sure to end the machine

	lastState = states[ states.length - 1 ]
	if lastState
		delete lastState.Next
		delete lastState.Catch
		lastState.End = true

	# -------------------------------------------------------
	# Define the definition

	statesObject = {}
	for item, index in states
		statesObject["State#{ index + 1 }"] = item

	definition = {
		StartAt: 'State1'
		States: statesObject
	}

	return { definition, resources }

export default resource (ctx) ->

	# region		= ctx.string '@Config.Region'
	# profile		= ctx.string '@Config.Profile'
	# Stack 		= ctx.string '@Config.Stack'
	# Name = ctx.string 'Name'

	{ definition, resources } = parse ctx

	# -------------------------------------------------------
	# Make the state machine

	ctx.addResource ctx.name, {
		Type: 'AWS::StepFunctions::StateMachine'
		Properties: {
			StateMachineName: ctx.name
			Definition: definition
			RoleArn: GetAtt "#{ ctx.name }Role", 'Arn'
			Tags: [
				...ctx.array 'Tags', []
				{ Key: 'ScheduleName', Value: ctx.name }
			]
		}
	}

	# -------------------------------------------------------
	# Make the role for the state machine

	ctx.addResource "#{ ctx.name }Role", {
		Type: 'AWS::IAM::Role'
		Properties: {
			AssumeRolePolicyDocument: {
				Version: '2012-10-17'
				Statement: [{
					Effect: 'Allow'
					Action: 'sts:AssumeRole'
					Principal:
						Service: Sub 'states.${AWS::Region}.amazonaws.com'
				}]
			}
			Policies: [{
				PolicyName: "#{ ctx.name }-Lambda-Policy"
				PolicyDocument: {
					Statement: [{
						Effect: 'Allow'
						Action: 'lambda:InvokeFunction'
						Resource: resources
					}]
				}
			}]
		}
	}

	# -------------------------------------------------------
	# Make the role for the CRON rule

	ctx.addResource "#{ ctx.name }EventRule", {
		Type: 'AWS::Events::Rule'
		Properties: {
			State: 'ENABLED'
			Description: "#{ ctx.name } Scheduled event to trigger our scheduler"
			ScheduleExpression: ctx.string [ 'Rate', 'Cron' ], 'rate(1 minute)'
			Targets: [{
				Arn:		Ref ctx.name
				Id:			GetAtt ctx.name, 'Name'
				RoleArn:	GetAtt "#{ ctx.name }EventRuleRole", 'Arn'
			}]
		}
	}

	# -------------------------------------------------------
	# Make the role for the CRON rule

	ctx.addResource "#{ ctx.name }EventRuleRole", {
		Type: 'AWS::IAM::Role'
		Properties: {
			AssumeRolePolicyDocument: {
				Version: '2012-10-17'
				Statement: [{
					Effect: 'Allow'
					Action: 'sts:AssumeRole'
					Principal:
						Service: 'events.amazonaws.com'
				}]
			}
			Policies: [{
				PolicyName: "#{ ctx.name }-Execution-Policy"
				PolicyDocument: {
					Statement: [{
						Effect: 'Allow'
						Action: 'states:StartExecution'
						Resource: Ref ctx.name
					}]
				}
			}]
		}
	}
