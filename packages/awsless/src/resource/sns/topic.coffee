
import resource from '../../feature/resource'

subscriptions = (ctx) ->
	list = ctx.array [ 'Subscription', 'Subscriptions' ], []
	if not list.length
		return { }

	return { Subscription: list }

export default resource (ctx) ->
	prefixName	= ctx.string '@Config.PrefixResourceName', ''
	name		= ctx.string [ 'Name', 'TopicName' ]
	name		= "#{ prefixName }#{ name }"

	ctx.addResource ctx.name, {
		Type:	'AWS::SNS::Topic'
		Region:	ctx.string '#Region', ''
		Properties: {
			TopicName: name
			...subscriptions ctx
			Tags: [
				...ctx.array 'Tags', []
				{ Key: 'Topic', Value: name }
			]
		}
	}
