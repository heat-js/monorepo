
import resource		from '../../../feature/resource'
import { GetAtt }	from '../../../feature/cloudformation/fn'

export default resource (ctx) ->

	Region	= ctx.string '#Region', ''
	postfix = ctx.string 'Postfix'

	ctx.addResource "#{ ctx.name }EventsRule#{ postfix }", {
		Type: 'AWS::Events::Rule'
		Region
		Properties: {
			State: 'ENABLED'
			ScheduleExpression: ctx.string 'Rate'
			Targets: [
				{
					Id:		ctx.name
					Arn:	GetAtt ctx.name, 'Arn'
					Input:	JSON.stringify ctx.any 'Input', {}
				}
			]
		}
	}

	ctx.addResource "#{ ctx.name }CronLambdaPermission#{ postfix }", {
		Type: 'AWS::Lambda::Permission'
		Region
		Properties: {
			FunctionName:	GetAtt ctx.name, 'Arn'
			Action:			'lambda:InvokeFunction'
			Principal:		'events.amazonaws.com'
			SourceArn:		GetAtt "#{ ctx.name }EventsRule#{ postfix }", 'Arn'
		}
	}

# export default class LambdaFunction extends Resource

# 	linkSns: (index, event) -> {}
# 	linkSqs: (index, event) -> {}
# 	linkCron: (index, event) -> {
# 		[ "#{ @name }_EventsRule_#{ index }" ]: {
# 			Type: 'AWS::Events::Rule'
# 			Properties: {
# 				State: 'ENABLED'
# 				ScheduleExpression: event.Rate
# 				Targets: [
# 					{
# 						Id:		@name
# 						Arn:	{ 'Fn::GetAtt': [ @name, 'Arn' ] }
# 						Input:	JSON.stringify event.Input
# 					}
# 				]
# 				...@tags()
# 			}
# 		}
# 		[ "#{ @name }_LambdaPermission_#{ index }" ]: {
# 			Type: 'AWS::Lambda::Permission'
# 			Properties: {
# 				FunctionName: { 'Fn::GetAtt': [ @name, 'Arn' ] }
# 				Action:	'lambda:InvokeFunction'
# 				Principal: 'events.amazonaws.com'
# 				SourceArn: { 'Fn::GetAtt': [ "#{ @name }_EventsRule_#{ index }", 'Arn' ] }
# 			}
# 		}
# 	}

# 	warmer: ->
# 		concurrency = @number 'Warmer', 0
# 		if not concurrency
# 			return {}

# 		return @linkCron 'Warmer', {
# 			Rate: 'rate(5 minutes)'
# 			Input: { warmer: true, concurrency }
# 		}

# 	events: ->
# 		resources = {}
# 		for event, index in @props.Events
# 			resources = {
# 				...resources
# 				...( switch event.Type
# 					when 'SNS'	then @linkSns index, event
# 					when 'SQS'	then @linkSqs index, event
# 					when 'CRON'	then @linkCron index, event
# 				)
# 			}

# 		return resources

# 	environmentVariables: -> {
# 		...( @vars.Lambda?.EnvironmentVariables or {} )
# 		...( @props.EnvironmentVariables or {} )
# 	}

# 	LogGroup: ->
# 		if not @boolean 'Logging', false
# 			return {}

# 		return {
# 			[ "#{ @name }_LogGroup" ]: {
# 				Type: "AWS::Logs::LogGroup",
# 				Properties: {
# 					LogGroupName:		"/aws/lambda/#{ @props.Name }",
# 					RetentionInDays:	14
# 				}
# 			}
# 		}

# 	resources: -> {
# 		[ @name ]: {
# 			Type: 'AWS::Lambda::Function'
# 			Properties: {
# 				Code: {
# 					S3Bucket:	@string 'DeploymentBucket', 'deployments.${var:profile}.${var:region}'
# 					S3Key:		'serverless/wheel/prod/1605198388359-2020-11-12T16:26:28.359Z/spin.zip'
# 				}
# 				FunctionName:	@props.Name
# 				Handler:		@props.Handler
# 				MemorySize:		@number 'MemorySize', 128
# 				Role:			{ 'Fn::GetAtt': [ 'IamRoleLambdaExecution', 'Arn' ] }
# 				Runtime:		@string 'Runtime', 'nodejs12.x'
# 				Timeout:		@number 'Timeout', 30
# 				Environment:	{ Variables: @environmentVariables() }

# 				...@tags { FunctionName: @props.Name }
# 			}
# 		}
# 		[ "#{ @name }_LambdaVersion_#{ Date.now() }" ]: {
# 			Type: 'AWS::Lambda::Version'
# 			DeletionPolicy: 'Retain'
# 			Properties: {
# 				FunctionName:	{ Ref: @name }
# 				CodeSha256:		@hash
# 			}
# 		}
# 		@events()
# 		@warmer()
# 		@LogGroup()
# 	}

# 	outputs: -> {
# 		[ "#{ @name }_Arn" ]: {
# 			Description: 'The Arn of the Lambda Function'
# 			Value: { 'Fn::GetAtt': [ @name, 'Arn' ] }
# 			Export: {
#       			Name: "#{ @vars.name }-#{ @name }-Arn"
# 			}
# 		}
# 		[ "#{ @name }_ArnVersioned" ]: {
# 			Description: 'The Versioned Arn of the Lambda Function'
# 			Value: { Ref: @name ] }
# 			Export: {
#       			Name: "#{ @vars.name }-#{ @name }-ArnVersioned"
# 			}
# 		}
# 	}
