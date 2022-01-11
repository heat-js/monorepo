
import objectPath from 'object-path'

export default (operations, template) ->
	return operations.map (string) ->
		[ path, operator, comparison, left, right ] = string
			.split ','
			.map (part) -> part.trim()

		value = objectPath.get template, (
			path
				.replace /^\//, ''
				.replace /\/$/, ''
				.replace /\//gm, '.'
		)

		result = switch operator
			when '=', 'eq', 'is'	then value is comparison
			when '!=', 'isnt'		then value isnt comparison
			when '>', 'gt'			then value > comparison
			when '>=', 'gte'		then value >= comparison
			when '<', 'lt'			then value < comparison
			when '<=', 'lte'		then value <= comparison

		return if result then left else right
