
import escape from 'escape-html'

ifExpression = (key, template, variables) ->
	if typeof variables[ key ] isnt 'undefined'
		return template

	return ''

unlessExpression = (key, template, variables) ->
	if typeof variables[ key ] is 'undefined'
		return template

	return ''

eachExpression = (key, template, variables) ->
	list = variables[ key ]
	if typeof list is 'undefined'
		return ''

	return list
		.map (item) ->
			return inject template, {
				...variables
				'this': item
			}
		.join ''

capitalize = (value) ->
	return value.charAt(0).toUpperCase() + value.slice 1

inject = (content, variables = {}) ->

	return content

		# -------------------------------------
		# parse expressions

		.replace /\{\{ *\#(?<expression>[a-z]+) +([a-z0-9\-\_]+) *\}\}([^#]*)(\{\{ *\/\k<expression> *\}\})/gi, (match, expression, key, template) ->
			return switch expression
				when 'if', 'exists' 	then ifExpression key, template, variables
				when 'unless'			then unlessExpression key, template, variables
				when 'for', 'each'		then eachExpression key, template, variables
				else match

		# -------------------------------------
		# parse variables

		.replace /\{\{(\!?)([a-z]*) *([a-z0-9\-\_]+) *\}\}/gi, (match, unsafe, helper, key) ->
			value = variables[ key ]

			if typeof value is 'undefined'
				return match

			if helper
				value = switch helper
					when 'cap', 'capitalize' then capitalize value
					when 'upper', 'uppercase' then value.toUpperCase()
					when 'lower', 'lowercase' then value.toLowerCase()

			if unsafe is '!'
				return value

			return escape value
