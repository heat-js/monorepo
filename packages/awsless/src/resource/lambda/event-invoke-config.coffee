
import resource		from '../../feature/resource'
import addPolicy	from './policy'

destination = (ctx, name) ->
	type = ctx.string "#{ name }.Type", ''
	if not type
		return

	arn = ctx.string [ "#{ name }.Arn", "#{ name }.Destination" ]

	switch type.toLowerCase()
		when 'sqs' then addPolicy ctx, 'lambda-async-sqs', {
			Effect:		'Allow'
			Action:		'sqs:SendMessage'
			Resource:	arn
		}

		# when 'sns' then addPolicy ctx, 'lambda-async-sns', {
		# 	Effect:		'Allow'
		# 	Action:		'sqs:SendMessage'
		# 	Resource:	arn
		# }

		# when 'lambda' then addPolicy ctx, 'lambda-async-lambda', {
		# 	Effect:		'Allow'
		# 	Action:		'sqs:SendMessage'
		# 	Resource:	arn
		# }

		else throw new TypeError "Invalid lambda async destination type: #{ type }"

	return {
		[ name ]: {
			Destination: arn
		}
	}


destinationConfig = (ctx) ->
	onFailure = destination ctx, 'OnFailure'
	onSuccess = destination ctx, 'OnSuccess'

	if not onFailure and not onSuccess
		return {}

	return {
		DestinationConfig: {
			...onFailure
			...onSuccess
		}
	}

export default resource (ctx) ->

	# Stack		= ctx.string [ '#Stack',	'@Config.Stack' ]
	Region		= ctx.string [ '#Region',	'@Config.Region' ]
	# Profile		= ctx.string [ '#Profile',	'@Config.Profile' ]

	ctx.addResource ctx.name, {
		Type: 'AWS::Lambda::EventInvokeConfig'
		# Stack
		Region
		# Profile
		Properties: {
			...destinationConfig ctx
			FunctionName:				ctx.string [ 'Name', 'FunctionName' ]
			MaximumEventAgeInSeconds:	ctx.number [ 'MaxEventAgeInSeconds', 'MaximumEventAgeInSeconds' ], 21600
			MaximumRetryAttempts:		ctx.number [ 'MaxRetryAttempts', 'MaximumRetryAttempts' ], 2
			Qualifier:					ctx.any 'Qualifier', '$LATEST'
		}
	}
