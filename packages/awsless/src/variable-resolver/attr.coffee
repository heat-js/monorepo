
import Attribute from '../attribute'

export default (attributes) ->
	return attributes.map (attribute) =>
		[ resource, name ] = attribute.split '.'
		return new Attribute resource, name
