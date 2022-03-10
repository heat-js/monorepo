
export default class SnsMock

	constructor: (topics = []) ->
		for topic in topics
			@[ topic ] = jest.fn()

	publish: jest.fn ({ service, topic, payload }) ->
		if topic and service
			topic = "#{ service }__#{ topic }"

		if not @[ topic ]
			@[ topic ] = jest.fn()

		return @[ topic ].call()

export createSnsMock = (topics) ->
	return new SnsMock topics
