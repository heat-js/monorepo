import Definition from '../definition'
import List from './list'

export default class Add extends Definition
	constructor: (@source, @what) ->
		super()

	get: (c, ...args) ->
		res = []

		if @source
			res = @source.get c, args...

		other = @what.get c, args...

		if not Array.isArray(res)
			other
		else
			res.concat(other)

	@expand: (c, what) ->
		List.expand c, what

	@make: (c, prev, what) ->
		if not Array.isArray(what)
			what = [what]

		if prev is null
			List.expand c, what
		else
			new Add(prev, List.expand(c, what))
