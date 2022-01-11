
querystring = require('querystring')

export default (countries = [], ips = [])->
	return (app, next) ->
		{ request, viewer } = app.input

		mimes = request.headers.accept?.value or ''
		mimes = mimes.split ','

		if not mimes.includes('text/html') and not mimes.includes('application/xhtml+xml')
			next app
			return

		userIp 	= viewer.ip
		country = request.headers['cloudfront-viewer-country'].value

		# ---------------------------------------------------------
		# Normalize querystring

		qstring = {}
		for key, { value } of request.querystring
			qstring[key] = value

		# ---------------------------------------------------------
		# Redirect a blocked country to a restricted version of the page

		if countries.includes(country) and (qstring.restricted isnt country) and not ips.includes(userIp)
			qstring.restricted = country

			url = [
				'https://'
				request.headers.host?.value
				request.uri
				'?' + querystring.stringify qstring
			]

			app.output = {
				statusCode: 		302
				statusDescription: 	'Redirecting to restricted domain'
				headers: {
					location: {
						value: url.join ''
					}
				}
			}
			return

		# ---------------------------------------------------------
		# Redirect a non-blocked country or a whitelisted ip
		# to a non restricted version of the page.

		if (not countries.includes(country) or ips.includes(userIp)) and qstring.restricted
			delete qstring.restricted

			url = [
				'https://'
				request.headers.host?.value
				request.uri
			]

			if Object.keys(qstring).length
				url.push '?' + querystring.stringify qstring

			app.output = {
				statusCode: 		302
				statusDescription: 	'Redirecting to non-restricted domain'
				headers: {
					location: {
						value: url.join ''
					}
				}
			}
			return


		next app
