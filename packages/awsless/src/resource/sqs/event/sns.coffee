
import resource	from '../../../feature/resource'
import { GetAtt, Ref, Sub, isFn, isArn } from '../../../feature/cloudformation/fn'

export default resource (ctx) ->

	Region	= ctx.string '#Region', ''
	postfix = ctx.string 'Postfix'
	topic	= ctx.string [ 'Topic', 'Arn', 'ARN' ]

	if not isFn(topic) and not isArn(topic)
		topic = Sub "arn:${AWS::Partition}:sns:${AWS::Region}:${AWS::AccountId}:#{ topic }"

	ctx.addResource "#{ ctx.name }SnsSubscription#{ postfix }", {
		Type: 'AWS::SNS::Subscription'
		Region
		Properties: {
			TopicArn: topic
			Protocol: 'sqs'
			Endpoint: GetAtt ctx.name, 'Arn'
			RawMessageDelivery: true
		}
	}

	ctx.addResource "#{ ctx.name }SnsQueuePolicy#{ postfix }", {
		Type: 'AWS::SQS::QueuePolicy'
		Region
		Properties: {
			Queues: [ Ref ctx.name ]
			PolicyDocument: {
				Version: '2012-10-17'
				Statement: [{
					Effect: 'Allow'
					Principal: '*'
					Action: [ 'sqs:SendMessage', 'sqs:SetQueueAttributes' ]
					Resource: GetAtt ctx.name, 'Arn'
					Condition: { ArnEquals: { 'aws:SourceArn': topic } }
				}]
			}
		}
	}
