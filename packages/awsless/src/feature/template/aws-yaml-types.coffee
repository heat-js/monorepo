
import YAML	from 'js-yaml'

# class Model

customType = (name, kind) ->
	return new YAML.Type "!#{ name }", {
		kind
		instanceOf: Object
		construct: (data) ->
			object = {}
			# model = new Model
			# model._data = data

			prefix = if name is 'Ref' then '' else 'Fn::'
			object["#{ prefix }#{ name }"] = switch kind
				when 'scalar'	then data
				when 'sequence'	then data or []
				when 'mapping'	then data or {}

			return object

		# represent: (model) ->
		# 	return model._data
	}

export default [
	customType 'Base64',		'mapping'
	customType 'ImportValue',	'mapping'

	customType 'Ref',			'scalar'
	customType 'Sub',			'scalar'
	customType 'GetAZs',		'scalar'
	customType 'GetAtt',		'scalar'
	customType 'Condition',		'scalar'
	customType 'ImportValue',	'scalar'
	customType 'Cidr',			'scalar'

	customType 'And',			'sequence'
	customType 'Equals',		'sequence'
	customType 'GetAtt',		'sequence'
	customType 'If',			'sequence'
	customType 'FindInMap',		'sequence'
	customType 'Join',			'sequence'
	customType 'Not',			'sequence'
	customType 'Or',			'sequence'
	customType 'Select',		'sequence'
	customType 'Sub',			'sequence'
	customType 'Split',			'sequence'
	customType 'Cidr',			'sequence'
]
