
import YAML	from 'js-yaml'

customType = (name, kind, sep) ->
	return new YAML.Type "!#{ name }", {
		kind
		instanceOf: String
		construct: (data) ->
			return switch kind
				when 'sequence' then "${ #{ name }:#{ data.join sep } }"
				else "${ #{ name }:#{ data } }"
	}

export default [
	customType 'when',	'sequence', ','
	customType 'attr',	'sequence', '.'
	customType 'attr',	'scalar'
	customType 'cf',	'sequence', ':'
	customType 'cf',	'scalar'
	customType 'var',	'sequence', '.'
	customType 'var',	'scalar'
	customType 'ssm',	'sequence', ':'
	customType 'ssm',	'scalar'
	customType 'opt',	'scalar'
	customType 'env',	'scalar'
]
