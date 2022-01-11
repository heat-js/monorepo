
import resource						from '../../../feature/resource'
import { GetAtt, Sub, isFn, isArn }	from '../../../feature/cloudformation/fn'
import addPolicy					from '../policy'

destinationConfig = (ctx) ->
	type = ctx.string 'OnFailure.Type', ''
	if not type
		return

	arn = ctx.string [ 'OnFailure.Arn', 'OnFailure.Destination' ]

	# switch type.toLowerCase()
	# 	when 'sqs' then addPolicy ctx, 'dynamodb-destination-sqs', {
	# 		Effect:		'Allow'
	# 		Action:		'sqs:SendMessage'
	# 		Resource:	arn
	# 	}

	# 	else throw new TypeError "Invalid dynamodb destination type: #{ type }"

	return {
		DestinationConfig: {
			OnFailure: {
				Destination: arn
			}
		}
	}

export default resource (ctx) ->

	Region	= ctx.string '#Region', ''
	postfix = ctx.string 'Postfix'
	source	= ctx.string [ 'Stream', 'Arn', 'ARN' ]

	if not isFn(source) and not isArn(source)
		source = Sub "arn:${AWS::Partition}:dynamodb:${AWS::Region}:${AWS::AccountId}:#{ source }"

	ctx.addResource "#{ ctx.name }SqsEventSourceMapping#{ postfix }", {
		Type: 'AWS::Lambda::EventSourceMapping'
		Region
		Properties: {
			Enabled:					true
			EventSourceArn:				source
			FunctionName:				GetAtt ctx.name, 'Arn'
			BatchSize:					ctx.number 'BatchSize', 100
			StartingPosition:			ctx.string 'StartingPosition', 'LATEST'
			ParallelizationFactor:		ctx.number 'ParallelizationFactor', 1
			BisectBatchOnFunctionError:	ctx.boolean 'BisectBatchOnFunctionError', false
			MaximumRecordAgeInSeconds:	ctx.number 'MaximumRecordAgeInSeconds', -1
			MaximumRetryAttempts:		ctx.number 'MaximumRetryAttempts', -1
			ParallelizationFactor:		ctx.number 'ParallelizationFactor', 1
			...destinationConfig ctx
		}
	}

	addPolicy ctx, 'dynamodb-stream-events', {
		Effect: 'Allow'
		Action: [
			'dynamodb:ListStreams'
			'dynamodb:DescribeStream'
			'dynamodb:GetRecords'
			'dynamodb:GetShardIterator'
		]
		Resource: source
	}
