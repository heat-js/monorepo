
export default (callback) ->
	return (context, name, properties, resource) ->
		# console.log context, name, properties
		callback context.copy(
			name
			{
				...resource
				Properties: properties
			}
		)
