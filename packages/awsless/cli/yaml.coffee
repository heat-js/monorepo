
import YAML	from 'js-yaml'
import fs	from 'fs'

customType = (name, kind, sep) ->
	return new YAML.Type "!#{ name }", {
		kind
		instanceOf: String
		construct: (data) ->
			return switch kind
				when 'sequence' then "${ #{ name }:#{ data.join sep } }"
				else "${ #{ name }:#{ data } }"
	}

schema = YAML.Schema.create [
	customType 'cf',	'sequence', ':'
	customType 'cf',	'scalar'
	customType 'var',	'sequence', '.'
	customType 'var',	'scalar'
	customType 'ssm',	'scalar'
	customType 'opt',	'scalar'
	customType 'env',	'scalar'
]

data = fs.readFileSync __dirname + '/test.yml'

console.log YAML.load data, {
	schema
}
