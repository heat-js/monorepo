
import { vi } from 'vitest'

export default class SnsMock

	constructor: (topics = []) ->
		for topic in topics
			@[ topic ] = vi.fn()

	publish: vi.fn ({ service, topic, payload }) ->
		if topic and service
			topic = "#{ service }__#{ topic }"

		if not @[ topic ]
			@[ topic ] = vi.fn()

		return @[ topic ].call()

export createSnsMock = (topics) ->
	return new SnsMock topics
