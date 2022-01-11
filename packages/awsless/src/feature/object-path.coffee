
import typeOf 		from 'type-of'
import objectPath 	from 'object-path'
import { isAttr }	from '../attribute'
import { isFn }		from './cloudformation/fn'

export default ({ template, resource, properties, paths, type, defaultValue }) ->
	if not Array.isArray paths
		paths = [ paths ]

	for path in paths
		if path[0] is '@'
			path = path.substr 1
			object = template
		else if path[0] is '#'
			path = path.substr 1
			object = resource
		else
			object = properties

		value		= objectPath.get object, path
		valueType	= typeOf value

		if valueType is 'undefined'
			continue

		if type and valueType isnt type
			if type is 'string' and valueType is 'object' and ( isFn(value) or isAttr(value) )
				return value

			throw new TypeError "Property \"#{ path }\" isnt a \"#{ type }\"."

		return value

	if typeof defaultValue isnt 'undefined'
		return defaultValue

	throw new TypeError "Property not defined with path \"#{ paths.join ', ' }\""
