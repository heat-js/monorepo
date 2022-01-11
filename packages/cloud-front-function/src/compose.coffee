
export default (middleware) ->

	if not Array.isArray middleware
		throw new TypeError 'Middleware stack must be an array!'

	return (params...) ->
		index = -1

		dispatch = (i) ->
			if i <= index
				throw new Error 'next() called multiple times'

			index = i
			fn = middleware[i]

			if i is middleware.length
				fn = params[params.length]

			if not fn
				return

			# try
			return fn.apply null, [
				...params
				dispatch.bind null, i + 1
			]

			# catch error
				# throw error

		return dispatch 0
