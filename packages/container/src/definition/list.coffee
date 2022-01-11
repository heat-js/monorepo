import Definition from '../definition'
import Predefinition from '../predefinition'

export default class List extends Definition
	constructor: (@list) ->
		super()

	get: (c, args) ->
		return @list.map (item) -> if item instanceof Definition then item.get(c, args) else item

	@expand: (c, what) ->
		new List Predefinition.expandArray c, what

	@make: (c, prev, what) ->
		List.expand c, what
