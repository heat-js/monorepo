import Definition from '../definition'

export default class Factory extends Definition
	constructor: (@func) ->
		super()

	get: (c, args) ->
		return @func(c, args...)

	@expand: (c, what) ->
		new Factory(what)

	@make: (c, prev, what) ->
		new Factory(what)
