
import compose from './compose'

export default (middlewares...) ->

	fn = compose middlewares

	handle = (event) ->
		app = {}
		app.input = event

		fn app

		return app.output

	return handle
