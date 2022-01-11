
export default (headers = {}) ->
	return (app, next) ->
		{ response } = app.input

		for key, value of headers
			if value is false
				delete response.headers[key]
				continue

			if Array.isArray value
				value = value.join '; '

			else if typeof value is 'object'
				directives = []
				for directiveKey, directiveValue of value
					if directiveValue is true
						directives.push directiveKey
						continue

					if Array.isArray directiveValue
						directiveValue = directiveValue.join ' '

					directives.push "#{directiveKey} #{directiveValue}"

				value = directives.join '; '

			response.headers[key] = { value }

		next app
