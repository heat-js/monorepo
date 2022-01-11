
export resolve = (data, globals) ->
	attr = new Attribute data.resource, data.name
	return attr.resolve globals

export isAttr = (value) ->
	return value instanceof Attribute or value.__type__ is 'Attribute'

export default class Attribute
	constructor: (@resource, @name) ->
		@__type__ = 'Attribute'

	resolve: (globals) ->
		return globals[ "attr-#{ @resource }-#{ @name }" ]
