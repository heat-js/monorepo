
export default class LambdaMock

	constructor: (lambdas = {}) ->
		Object.assign @, lambdas

	on: (name, callback) ->
		@[ name ] = callback

	invoke: jest.fn ({ service, name, payload }) ->
		if name and service
			name = "#{ service }__#{ name }"

		callback = @[ name ]
		if not callback
			throw new Error "Lambda mock function not defined for: #{ name }"

		return await callback payload

	invokeAsync: jest.fn (params) ->
		await @invoke params
		return @

export createLambdaMock = (lambdas) ->
	return new LambdaMock lambdas
