
import resolveVariables	from '../../../src/feature/template/resolve-variables'
import Var				from '../../../src/variable-resolver/var'
import Attr				from '../../../src/variable-resolver/attr'
import When				from '../../../src/variable-resolver/when'
import Attribute		from '../../../src/attribute'
# import opt				from '../../../src/variable-resolver/var'

describe 'Resolve Variables', ->
	resolvers = {
		'var':	Var
		'attr':	Attr
		'when':	When
	}

	it 'should resolve simple variables', ->
		template = {
			foo: 'bar'
			key: '${ var:foo }'
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual {
				foo: 'bar'
				key: 'bar'
			}

	it 'should resolve attributes', ->
		template = {
			key: '${ attr:resource.name }'
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual {
				key: new Attribute 'resource', 'name'
			}

	it 'should resolve variables in text', ->
		template = {
			foo: 'bar'
			1: 'prefix-${ var:foo }'
			2: '${ var:foo }-postfix'
			3: 'prefix-${ var:foo }-postfix'
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual {
				foo: 'bar'
				1: 'prefix-bar'
				2: 'bar-postfix'
				3: 'prefix-bar-postfix'
			}

	it 'should resolve variables in an array', ->
		template = {
			var1: 1
			var2: 2
			array: [
				'bar'
				'foo'
				'${ var:array.0 }'
				'${ var:array.1 }'
				{ key: '${ var:var2 }' }
				{ key: '${ var:var1 }' }
			]
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual {
				var1: 1
				var2: 2
				array: [
					'bar'
					'foo'
					'bar'
					'foo'
					{ key: 2 }
					{ key: 1 }
				]
			}

	it 'should resolve multiple variables in single line', ->
		template = {
			var1: 'bar'
			var2: 'foo'
			test: 'Hallo ${ var:var1 } ${ var:var2 } ${ var:var1 } World'
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual {
				var1: 'bar'
				var2: 'foo'
				test: 'Hallo bar foo bar World'
			}

	it 'should resolve deep paths', ->
		template = {
			multi:
				test: '${ var:multi.level.foo }'
				level:
					foo: 'bar'
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual {
				multi:
					test: 'bar'
					level:
						foo: 'bar'
			}

	it 'should resolve recursive variables', ->
		template = {
			one: 'a'
			three: 'b-${ var:two }'
			two: 'c-${ var:one }'
			four: 'd-${ var:three }'
			five: 'e-${var:three}'
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual {
				one: 'a'
				two: 'c-a'
				three: 'b-c-a'
				four: 'd-b-c-a'
				five: 'e-b-c-a'
			}

	it 'should resolve structures', ->
		template = {
			var1: { prop: true }
			var2: { prop: '${var:var1}' }
			var3: '${var:var2}'
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual {
				var1: { prop: true }
				var2: { prop: { prop: true } }
				var3: { prop: { prop: true } }
			}

	it 'should not resolve native aws variables', ->
		template = {
			AWS: '1'
			var: '${AWS::Region}'
		}

		result = await resolveVariables template, resolvers
		expect result
			.toStrictEqual template

	it 'should not resolve unknown resolvers or paths', ->
		template = {
			unknownPath: '${ var:abc }'
			unknownResolver: '${ unk:abc }'
		}

		await expect resolveVariables template, resolvers
			.rejects.toThrow 'Unable to resolve variables'
