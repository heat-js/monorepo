
import { describe, it } from 'vitest'
import { float, integer, string, ssm, array, json } from '../src/index'
import { mockSSM } from '@heat/aws-test'

describe('SSM', () => {

	mockSSM({
		'/string': 'string',
		'/integer': '1',
		'/float': '1.1',
		'/array': 'one, two',
		'/json': '{"foo":"bar"}',
	})

	type JSON = {
		foo: 'bar'
	}

	it('should resolve ssm paths', async () => {
		const result = await ssm({
			default: 'string',
			string: string('string'),
			integer: integer('integer'),
			float: float('float'),
			array: array<string>('array'),
			json: json<JSON>('json'),
		})

		expect(result).toStrictEqual({
			default: 'string',
			string: 'string',
			integer: 1,
			float: 1.1,
			array: ['one', 'two'],
			json: { foo: 'bar' },
		})
	})

	it('should cache paths results', async () => {
		let count = 0
		const fetch = (ttl:number) => ssm({
			key: {
				path: 'string', transform: () => ++count
			}
		}, { ttl })

		expect(await fetch(0)).toStrictEqual({ key: 1 })
		expect(await fetch(0)).toStrictEqual({ key: 2 })

		expect(await fetch(10)).toStrictEqual({ key: 3 })
		expect(await fetch(10)).toStrictEqual({ key: 3 })
	})

})
