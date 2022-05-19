
import resource		from '../../feature/resource'
# import { Ref, Sub }	from '../../feature/cloudformation/fn'
# import addPolicy 	from './policy'

corsConfig = (ctx) ->
	cors = ctx.object 'Cors', {}

	if not Object.keys(cors).length
		return

	return { Cors: cors }

export default resource (ctx) ->
	region		= ctx.string [ '#Region',	'@Config.Region' ]
	authType 	= ctx.string 'AuthType', 'NONE'

	ctx.addResource ctx.name, {
		Type: 	'AWS::Lambda::Url'
		Region:	region
		Properties: {
			...corsConfig ctx
			TargetFunctionArn:	ctx.string [ 'Name', 'FunctionName' ]
			AuthType:			authType
		}
	}

	if authType is 'NONE'
		ctx.addResource "#{ ctx.name }FunctionUrlPublicAccess", {
			Type: 	'AWS::Lambda::Permission'
			Region: region
			Properties: {
				Action:					'lambda:InvokeFunctionUrl'
				FunctionName:			ctx.string [ 'Name', 'FunctionName' ]
				Principal:				'*'
				FunctionUrlAuthType: 	'NONE'
			}
		}

		# addPolicy ctx, 'lambda-function-url-public-access', {
		# 	Effect:		'Allow'
		# 	Action:		'lambda:invokeFunctionUrl'
		# 	Principal:	'*'
		# 	Resource:	Sub "arn:${AWS::Partition}:lambda:${AWS::Region}:${AWS::AccountId}:function:#{ ctx.string [ 'Name', 'FunctionName' ] }"
		# 	Condition: {
		# 		StringEquals: {
		# 			'lambda:FunctionUrlAuthType': 'NONE'
		# 		}
		# 	}
		# }
