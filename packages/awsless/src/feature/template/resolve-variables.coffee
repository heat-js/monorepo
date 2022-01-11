
makeRegex = ->
	return /\$\{ *(([a-z]+)\:([a-z0-9-_/\.\,:]+)) *\}/gmi

# makeFullRegex = ->
# 	return /^\$\{ *(([a-z]+)\:([a-z0-9-_/\.:]+)) *\}$/gmi

variablesItem = (variableResolvers, variables, key, value, object) ->
	switch typeof value
		when 'string'
			regex = makeRegex()
			while matches = regex.exec value
				[ string, match, type, path ] = matches

				if not variableResolvers[type]
					continue

				# console.log 'full', string, value
				variables.push { key, object, match, type, path, full: string is value }

			# regex = makePartialRegex()
			# while matches = regex.exec value
			# 	[ _, match, type, path ] = matches

			# 	if not variableResolvers[type]
			# 		continue

			# 	variables.push { key, object, match, type, path, full: true }

		when 'object', 'array'
			findVariables variableResolvers, variables, value

findVariables = (variableResolvers, variables, object) ->
	switch typeof object
		when 'array'
			for value, key in object
				variablesItem variableResolvers, variables, key, value, object
		when 'object'
			for key, value of object
				variablesItem variableResolvers, variables, key, value, object

condenseReplacements = (replacements) ->

	regex = makeRegex()
	limit = 10
	while limit--
		replaced = false
		for original, replacement of replacements
			if typeof replacement isnt 'string'
				continue

			replacements[ original ] = replacement.replace regex, (_, match) ->
				replaced = true
				return replacements[ match ]

		if not replaced
			break

	return replacements

	# limit = 10
	# while limit--
	# 	replaced = false
	# 	for original, replacement of replacements
	# 		value = replacements[ replacement ]
	# 		if typeof value isnt 'undefined'
	# 			replacements[ original ] = value
	# 			replaced = true

	# 	if not replaced
	# 		break

	# console.log replacements

	# return replacements

getVariableReplacements = (variableResolvers, variables, template) ->
	replacements = {}
	for type, resolver of variableResolvers
		list = variables.filter (entry) ->
			return type is entry.type

		if list.length
			matches = {}
			for item in list
				matches[ item.path ] = item.match

			paths	= Object.keys matches
			matches = Object.values matches
			values	= await resolver paths, template

			for replacement, index in values
				match = matches[ index ]
				replacements[ match ] = replacement

	return replacements

export default (template, variableResolvers = {}) ->
	template = JSON.parse JSON.stringify template
	variables = []
	findVariables variableResolvers, variables, template

	# console.log 'variables', variables

	replacements = await getVariableReplacements variableResolvers, variables, template
	# console.log 'replacements 1', replacements

	replacements = condenseReplacements replacements

	# console.log 'replacements 2', replacements

	regex = makeRegex()
	errors = []

	# console.log variables

	for entry in variables
		if entry.full
			replacement = replacements[ entry.match ]
			if typeof replacement is 'undefined'
				errors.push entry.match
			else
				entry.object[ entry.key ] = replacement

		else
			entry.object[ entry.key ] = entry.object[ entry.key ].replace regex, (original, match) ->
				if match isnt entry.match
					return original

				replacement = replacements[ match ]
				if typeof replacement is 'undefined'
					errors.push match
					return original

				return replacement

		# 		return replacements[ entry.match ]

		# replacement = replacements[ entry.match ]

		# if typeof replacement isnt 'undefined'
		# 	value = value.replace entry.match, replacement
		# 	# console.log entry.object[ entry.key ], value, replacement
		# 	entry.object[ entry.key ] = value
		# else
		# 	errors.push entry.match

	if errors.length
		throw new Error "Unable to resolve variables: #{ errors.join ', ' }"

	return template

	# errors = []

	# for entry, index in variables
	# 	value		= entry.object[ entry.key ]
	# 	replacement = replacements[ entry.match ]

	# 	if typeof replacement isnt 'undefined'
	# 		value = value.replace entry.match, replacement
	# 		# console.log entry.object[ entry.key ], value, replacement
	# 		entry.object[ entry.key ] = value
	# 	else
	# 		errors.push entry.match

	# if errors.length
	# 	throw new Error "Unable to resolve variables: #{ errors.join ', ' }"

	# return template
