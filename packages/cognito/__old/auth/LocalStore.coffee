export default class Store

	constructor: ({ @prefix = 'auth' } = {}) ->

	level: (next) ->
		return new Store {
			prefix: "#{ @prefix }.#{ next }"
		}

	key: (name) ->
		return "#{@prefix}.#{name}"

	get: (name) ->
		return localStorage.getItem @key name

	has: (name) ->
		return null isnt @get name

	set: (name, value) ->
		localStorage.setItem(
			@key name
			value
		)

	remove: (name) ->
		localStorage.removeItem @key name
