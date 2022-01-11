
import resource from '../../feature/resource'
import sns		from './event/sns'

redrivePolicy = (ctx) ->
	deadLetter = ctx.string 'DeadLetterArn', ''
	if not deadLetter
		return {}

	return {
		RedrivePolicy: {
			maxReceiveCount: 5
			deadLetterTargetArn: deadLetter
		}
	}

export default resource (ctx) ->

	prefixName	= ctx.string '@Config.PrefixResourceName', ''
	events		= ctx.array 'Events', []
	name		= ctx.string [ 'Name', 'QueueName' ]
	name		= "#{ prefixName }#{ name }"

	for event, index in events
		event	= { ...event, Postfix: String index }
		type	= ctx.string "Events.#{ index }.Type"

		switch type.toLowerCase()
			when 'sns' then sns ctx, ctx.name, event
			else throw TypeError "Unknown sqs event type: \"#{type}\""

	ctx.addResource ctx.name, {
		Type:	'AWS::SQS::Queue'
		Region:	ctx.string '#Region', ''
		Properties: {
			QueueName:				name
			MessageRetentionPeriod: ctx.number 'MessageRetentionPeriod', 1209600
			VisibilityTimeout:		ctx.number 'VisibilityTimeout', 30

			...redrivePolicy ctx

			Tags: [
				...ctx.array 'Tags', []
				{ Key: 'QueueName', Value: name }
			]
		}
	}
