
import ExtendableError from 'extendable-error'

export default class ViewableError extends ExtendableError

	constructor: (message) ->
		prefix = '[viewable] '
		if 0 isnt message.indexOf prefix
			message = prefix + message

		super message
