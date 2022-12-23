
import { describe, it, expect } from 'vitest'
import { ql } from '../src/index'

describe('Query Language', () => {

	it('should parse sql to expression', async () => {
		const result = ql`#id = ${1}, #name = helper(#name, ${2})`

		expect(result).toStrictEqual({
			expression: '#id = :v1, #name = helper(#name, :v2)',
			names: { '#id': 'id', '#name': 'name' },
			values: { ':v1': 1, ':v2': 2 }
		})
	})

	it('should generate unique value keys for a new query', async () => {
		const result = ql`#other = ${3}`

		expect(result).toStrictEqual({
			expression: '#other = :v3',
			names: { '#other': 'other' },
			values: { ':v3': 3 }
		})
	})
})
