
export default ->
	return (app, next) ->
		{ response } = app.input

		# ---------------------------------------------------------
		# Replace headers beginning with x-amz-meta

		prefix = 'x-amz-meta-'

		for key, { value } of response.headers
			if prefix is key.slice 0, prefix.length
				stripped = key.slice prefix.length

				response.headers[stripped] = {
					value
				}

				delete response.headers[key]

		next app
