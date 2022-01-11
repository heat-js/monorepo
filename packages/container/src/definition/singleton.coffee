import Definition from '../definition'

export default class Singleton extends Definition
	instance: null
	created: false

	constructor: (@what) ->
		super()

	get: (c, args) ->
		if not @created
			@instance = @what.get(c, args)
			@created = true

		@instance


	@make: (c, prev, what) ->
		return new Singleton what
