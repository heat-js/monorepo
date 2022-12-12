
import { describe, it, expect } from 'vitest'
import { handle, config } from '../../src'
import { string, integer, float, boolean, array, json, enumeration } from '../../src/services/environment'

describe('Config', () => {

	process.env.STRING = 'string'
	process.env.INTEGER = '1'
	process.env.FLOAT = '1.1'
	process.env.BOOLEAN = 'yes'
	process.env.ARRAY = '1,2,3'
	process.env.JSON = '{"test":true}'
	process.env.ENUM = 'prod'

	const definition = () => ({
		string: string('STRING'),
		integer: integer('INTEGER'),
		float: float('FLOAT'),
		boolean: boolean('BOOLEAN'),
		array: array('ARRAY'),
		json: json('JSON'),
		enumeration: enumeration('ENUM', ['prod', 'dev']),
	})

	it('should access config data', async () => {
		const fn = handle(
			config(definition),
			(app) => app.output = app.config
		)

		const result = await fn()

		expect(result).toStrictEqual({
			string: 'string',
			integer: 1,
			float: 1.1,
			boolean: true,
			array: ['1', '2', '3'],
			json: { test: true },
			enumeration: 'prod'
		})
	})
})
