
export default ->
	return (app, next) ->
		{ request } = app.input

		host = request.headers?.host?.value

		if host and host.startsWith 'www.'
			app.output = {
				statusCode: 		301
				statusDescription: 	'Redirecting to apex domain'
				headers: {
					location: {
						value: "https://#{ host.substr 4 }#{ request.uri }"
					}
				}
			}
			return

		next app
