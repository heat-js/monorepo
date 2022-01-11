import Definition from '../definition'
import Predefinition from '../predefinition'

export default class Alias extends Definition
	constructor: (@name) ->
		super()

	get: (c, args) ->
		c.get @name, args...

	@expand: (c, what) ->
		new Alias Predefinition.expand c, what

	@make: (c, prev, what) ->
		Alias.expand c, what
