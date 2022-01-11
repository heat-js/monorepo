import Definition from '../definition'

export default class Value extends Definition
	constructor: (@value) ->
		super()

	get: ->
		@value

	@expand: (c, what) ->
		new Value what

	@make: (c, prev, what) ->
		new Value what
