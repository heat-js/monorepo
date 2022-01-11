
import Context from '../../context'
import Emitter from '../../emitter'

export default (template, customResources = {}) ->

	emitter = new Emitter
	context = new Context { template, emitter }

	for name, resource of template
		type			= resource.Type or ''
		customResource	= customResources[ type ]

		if customResource
			await customResource(
				context
				name
				resource.Properties or {}
				resource
			)

		else if 0 is type.indexOf 'AWS::'
			context.addResource name, resource

	return context
