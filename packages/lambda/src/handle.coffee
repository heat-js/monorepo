
import Container 	from '@heat/container'
# import Warmer 		from './middleware/warmer'
import compose 		from './compose'
import EventEmitter from 'events'

export default (middlewares...) ->

	# middlewares.unshift new Warmer

	fn 		= compose middlewares
	emitter = new EventEmitter

	# ----------------------------------------------------

	handle = (input, context = {}, callback) ->

		app = Container.proxy()
		app.value 'context', 	context
		app.value 'input', 		input
		app.value 'callback', 	callback
		app.value 'emitter', 	emitter

		# ----------------------------------------------------
		# Save the last used app container.

		handle.app = app

		# ----------------------------------------------------
		# Run composed middleware functions.

		try
			await fn app

		catch error

			# Lambda supports errors with extra data.
			if callback
				callback error, if error.getData then error.getData()
				return
			else
				throw error

		# ----------------------------------------------------
		# Handle response.

		output = if app.has 'output'
			app.output

		# Support for the old callback function.
		if callback
			callback null, output
			return

		return output

	# ----------------------------------------------------

	handle.on 	= emitter.on.bind emitter
	handle.app 	= null

	return handle
