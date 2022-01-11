import Definition from '../definition'
import Predefinition from '../predefinition'

export default class Get extends Definition
	constructor: (@name, @args) ->
		super()

	get: (c) ->
		c.get @name, @args...

	@expand: (c, what, args) ->
		new Get Predefinition.expand(c, what), Predefinition.expandArray(c, args)

	@make: (c, prev, what, args) ->
		Get.expand c, what, args
