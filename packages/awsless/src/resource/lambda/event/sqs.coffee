
import resource						from '../../../feature/resource'
import { GetAtt, Sub, isFn, isArn }	from '../../../feature/cloudformation/fn'
import addPolicy					from '../policy'

export default resource (ctx) ->

	Region	= ctx.string '#Region', ''
	postfix = ctx.string 'Postfix'
	queue	= ctx.string [ 'Queue', 'Arn', 'ARN' ]

	if not isFn(queue) and not isArn(queue)
		queue = Sub "arn:${AWS::Partition}:sqs:${AWS::Region}:${AWS::AccountId}:#{ queue }"

	ctx.addResource "#{ ctx.name }SqsEventSourceMapping#{ postfix }", {
		Type: 'AWS::Lambda::EventSourceMapping'
		Region
		Properties: {
			FunctionName:	GetAtt ctx.name, 'Arn'
			Enabled:		true
			BatchSize:		ctx.number 'BatchSize', 10
			EventSourceArn: queue
			MaximumBatchingWindowInSeconds:	ctx.number [ 'MaximumBatchingWindowInSeconds' ], 10
		}
	}

	addPolicy ctx, 'lambda-events', {
		Effect: 'Allow'
		Action: [
			'sqs:ReceiveMessage'
			'sqs:DeleteMessage'
			'sqs:GetQueueAttributes'
		]
		Resource: queue
	}
