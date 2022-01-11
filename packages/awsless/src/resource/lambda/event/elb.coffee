
import resource				from '../../../feature/resource'
import { GetAtt, Ref, Sub }	from '../../../feature/cloudformation/fn'

conditions = (ctx) ->
	list = []
	path = ctx.string 'Path', ''
	if path then list.push {
		Field: 'path-pattern'
		PathPatternConfig: { Values: [ path ] }
	}

	method = ctx.string 'Method', ''
	if method then list.push {
		Field: 'http-request-method'
		HttpRequestMethodConfig: { Values: [ method ] }
	}

	return list

export default resource (ctx) ->

	stack			= ctx.string [ '#Stack',	'@Config.Stack' ]
	Region			= ctx.string '#Region', ''
	postfix 		= ctx.string 'Postfix'
	listener		= ctx.string [ 'Listener', 'Arn', 'ARN' ]
	priority		= ctx.number 'Priority'
	targetGroupName	= "#{ stack }-#{ ctx.name }-#{ postfix }"

	ctx.addResource "#{ ctx.name }ElbLambdaPermission#{ postfix }", {
		Type: 'AWS::Lambda::Permission'
		Region
		Properties: {
			FunctionName: GetAtt ctx.name, 'Arn'
			Action:		'lambda:InvokeFunction'
			Principal:	'elasticloadbalancing.amazonaws.com'
			SourceArn:	Sub "arn:${AWS::Partition}:elasticloadbalancing:${AWS::Region}:${AWS::AccountId}:targetgroup/#{ targetGroupName }/*"
		}
	}

	ctx.addResource "#{ ctx.name }ElbListenerRule#{ postfix }", {
		Type: 'AWS::ElasticLoadBalancingV2::ListenerRule'
		Region
		Properties: {
			Actions: [{
				Type: 'forward'
				TargetGroupArn: Ref "#{ ctx.name }ElbTargetGroup#{ postfix }"
			}]
			Conditions: conditions ctx
			ListenerArn: listener
			Priority: priority
		}
	}

	ctx.addResource "#{ ctx.name }ElbTargetGroup#{ postfix }", {
		Type: 'AWS::ElasticLoadBalancingV2::TargetGroup'
		Region
		DependsOn: [
			"#{ ctx.name }ElbLambdaPermission#{ postfix }"
		]
		Properties: {
			Name: targetGroupName
			TargetType: 'lambda'
			Targets: [
				{ Id: GetAtt ctx.name, 'Arn' }
			]
		}
	}
