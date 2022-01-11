
export default class Emitter

	constructor: ->
		@events = {}
		@keys = []

	on: (eventName, callback) ->
		if Array.isArray eventName
			return eventName.map (name) =>
				@on name, callback

		list = @events[ eventName ]
		if not list
			list = @events[ eventName ] = []

		list.push callback

	once: (key, eventName, callback) ->
		# if Array.isArray eventName
		# 	return eventName.map (name) =>
		# 		@on name, callback

		key = "#{ key }-#{ eventName }"

		if @keys.includes key
			return

		@keys.push key
		@on eventName, callback

	emit: (eventName, ...props) ->
		list = @events[ eventName ]
		if not list
			return

		for callback in list
			await callback.apply null, props

	emitParallel: (eventName, ...props) ->
		list = @events[ eventName ]
		if not list
			return

		return Promise.all list.map (callback) ->
			return callback.apply null, props
