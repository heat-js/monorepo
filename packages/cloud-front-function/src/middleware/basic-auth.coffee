
export default (encodedAuthString) ->
	return (app, next) ->
		{ request } = app.input

		if request?.headers?.authorization?.value isnt 'Basic ' + encodedAuthString
			app.output = {
				statusCode: 		401
				statusDescription: 	'Unauthorized'
				headers: {
					'www-authenticate': {
						value: 'Basic'
					}
				}
			}
			return

		next app
