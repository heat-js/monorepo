
export default class SqsMock

	constructor: (queues = []) ->
		for queue in queues
			@[ queue ] = jest.fn()

	send: jest.fn ({ service, name, payload }) ->
		if service and name
			name = "#{ service }__#{ name }"

		if not @[ name ]
			@[ name ] = jest.fn()

		return @[ name ].call()

export createSqsMock = (queues) ->
	return new SqsMock queues
