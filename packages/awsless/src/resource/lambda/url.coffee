
import resource		from '../../feature/resource'
import addPolicy 	from './policy'

corsConfig = (ctx) ->
	cors = ctx.object 'Cors', {}

	if not Object.keys(cors).length
		return

	return { Cors: cors }

export default resource (ctx) ->
	Region = ctx.string [ '#Region', '@Config.Region' ]
	authType = ctx.string 'AuthType', 'NONE'

	ctx.addResource ctx.name, {
		Type: 'AWS::Lambda::Url'
		Region
		Properties: {
			...corsConfig ctx
			TargetFunctionArn:	ctx.string [ 'Name', 'FunctionName' ]
			AuthType:			authType
		}
	}

	if authType is 'NONE'
		addPolicy ctx, 'lambda-function-url', {
			Effect:		'Allow'
			Action:		'lambda:invokeFunctionUrl'
			Resource:	'*'
		}
