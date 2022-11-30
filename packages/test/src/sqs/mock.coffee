
export default class SqsMock

	constructor: (queues = []) ->
		for queue in queues
			@[ queue ] = vi.fn()

	send: vi.fn ({ service, name, payload }) ->
		if service and name
			name = "#{ service }__#{ name }"

		if not @[ name ]
			@[ name ] = vi.fn()

		return @[ name ].call()

export createSqsMock = (queues) ->
	return new SqsMock queues
