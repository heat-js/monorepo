
import resource	from '../../feature/resource'

corsConfig = (ctx) ->
	cors = ctx.object 'Cors', {}

	if not Object.keys(cors).length
		return

	return { Cors: cors }

export default resource (ctx) ->
	Region = ctx.string [ '#Region', '@Config.Region' ]

	ctx.addResource ctx.name, {
		Type: 'AWS::Lambda::Url'
		Region
		Properties: {
			...corsConfig ctx
			TargetFunctionArn:	ctx.string [ 'Name', 'FunctionName' ]
			AuthType:			ctx.string 'AuthType', 'NONE'
		}
	}
