
export default class AbstractMiddleware

	handle: (app, next) ->
		await next()
