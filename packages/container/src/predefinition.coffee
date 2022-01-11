export default class Predefinition
	constructor: (@what, @args) ->

	expand: (c) ->
		@what.expand c, @args...

	@expandArray: (c, items) ->
		items.map (item) -> Predefinition.expand c, item

	@expand: (c, item) ->
		if item instanceof Predefinition
			item.expand c
		else
			item

	make: (c, name) ->
		prev = null

		if c.definitions.has name
			prev = c.definitions.get name

		@what.make c, prev, @args...
