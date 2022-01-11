
import resolveVariables	from '../../../src/feature/template/resolve-variables'
import When				from '../../../src/variable-resolver/when'

describe 'Resolve Variables', ->
	resolvers = {
		'when':	When
	}

	it 'should resolve', ->
		template = {
			foo: 'bar'
			key1: '${ when:foo,is,bar,true,false }'
			key2: '${ when:foo,isnt,bar,true,false }'
			# key3: {
			# 	'!when': [ 'foo', 'isnt', 'bar', true, false ]
			# }
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual {
				foo: 'bar'
				key1: 'true'
				key2: 'false'
			}
