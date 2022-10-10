
import resource			from '../../../feature/resource'
import { GetAtt, Sub }	from '../../../feature/cloudformation/fn'

export default resource (ctx) ->

	Region	= ctx.string '#Region', ''
	postfix	= ctx.string 'Postfix'
	sql		= ctx.string [ 'Sql', 'SQL' ]
	name	= ctx.string [ 'Name', 'RuleName' ]

	ctx.addResource "#{ ctx.name }ElbLambdaPermission#{ postfix }", {
		Type: 'AWS::Lambda::Permission'
		Region
		Properties: {
			FunctionName:	GetAtt ctx.name, 'Arn'
			Action:			'lambda:InvokeFunction'
			Principal:		'iot.amazonaws.com'
			SourceArn:		Sub "arn:${AWS::Partition}:iot:${AWS::Region}:${AWS::AccountId}:rule/#{ name }"
		}
	}

	ctx.addResource "#{ ctx.name }IotTopicRule#{ postfix }", {
		Type: 'AWS::IoT::TopicRule'
		Region
		Properties: {
			RuleName: name
			TopicRulePayload: {
				Sql: sql
				AwsIotSqlVersion: '2016-03-23'
				RuleDisabled: false
				Actions: [
					{ Lambda: { FunctionArn: GetAtt ctx.name, 'Arn' } }
				]
			}
		}
	}
