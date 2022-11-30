
export default class LambdaMock

	constructor: (lambdas = {}) ->
		for name, callback of lambdas
			@on name, callback

	on: (name, callback) ->
		if typeof callback is 'function'
			@[ name ] = vi.fn callback
		else
			@[ name ] = vi.fn -> callback

	invoke: vi.fn ({ service, name, payload }) ->
		if name and service
			name = "#{ service }__#{ name }"

		callback = @[ name ]
		if not callback
			throw new Error "Lambda mock function not defined for: #{ name }"

		return await callback payload

	invokeAsync: vi.fn (params) ->
		await @invoke params
		return @

export createLambdaMock = (lambdas) ->
	return new LambdaMock lambdas
