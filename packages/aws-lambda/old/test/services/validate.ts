
import { describe, it, expect } from 'vitest'
import { object, optional } from 'superstruct'
import { bigfloat, date, uuid, positive, precision, lowercase, uppercase, string, validate, ValidationError } from '../../src/services/validate'
import { BigFloat } from '../../src/services/bigfloat'

describe('Validate Types', () => {

	const testRule = (type, { valid, invalid, validate }) => {
		describe(type, () => {
			it(`valid`, () => {
				valid.forEach((value) => {
					validate(value)
				})
			})

			it(`invalid`, () => {
				invalid.forEach((value) => {
					expect(() => validate(value)).toThrow(ValidationError)
				})
			})
		})
	}

	testRule('big float', {
		valid: [0, -1, 1, '0', '1', '-1', new BigFloat(1), new BigFloat('1')],
		invalid: [null, undefined, true, false, NaN, '', 'a', [], {}, new Date(), new Set(), new Map()],
		validate: (value) => {
			const result = validate(value, bigfloat())
			expect(result.toString()).toBe(value.toString())
		}
	})

	testRule('big float positive', {
		valid: [1, 100, 1000],
		invalid: [0, -1, -100, -1000],
		validate: (value) => {
			const result = validate(value, positive(bigfloat()))
			expect(result.toString()).toBe(value.toString())
		}
	})

	testRule('big float precision', {
		valid: [0, 1, 100, 1000, 0.01, 100.01],
		invalid: [0.001, 100.0001],
		validate: (value) => {
			const result = validate(value, precision(bigfloat(), 2))
			expect(result.toString()).toBe(value.toString())
		}
	})

	testRule('date', {
		valid: [ '1-1-2000', '01-01-2000', new Date() ],
		invalid: [null, undefined, true, false, NaN, '', 'a', 'today', [], {}, new Set(), new Map()],
		validate: (value) => {
			const result = validate(value, date())
			expect(result).toBeInstanceOf(Date)
		}
	})

	testRule('uuid', {
		valid: [
			'857b3f0a-a777-11e5-bf7f-feff819cdc9f', // v1
			'9a7b330a-a736-21e5-af7f-feaf819cdc9f', // v2
			'0a7b330a-a736-35ea-8f7f-feaf019cdc00', // v3
			'c51c80c2-66a1-442a-91e2-4f55b4256a72', // v4
			'5a2de30a-a736-5aea-8f7f-ad0f019cdc00', // v5
		],
		invalid: [
			null, undefined, true, false, NaN, '', 'a', [], {}, new Date(), new Set(), new Map(),
			'00000000-0000-0000-0000-000000000000',
		],
		validate: (value) => {
			const result = validate(value, uuid())
			expect(result).toBe(value)
		}
	})

	describe('Typings', () => {
		it(`should have correct types`, () => {
			const value = {
				a: new BigFloat(1),
				b: new Date(),
				c: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
			}

			const result1 = validate(value, object({
				a: bigfloat(),
				b: date(),
				c: uuid(),
			}))

			const result2 = validate(value, object({
				a: optional(bigfloat()),
				b: optional(date()),
				c: optional(uuid()),
			}))
		})
	})

	testRule('lowercase', {
		valid: [ 'heLLo', 'WORld', '123' ],
		invalid: [],
		validate: (value) => {
			const result = validate(value, lowercase(string()))
			expect(result).toBe(value.toLowerCase())
		}
	})

	testRule('uppercase', {
		valid: [ 'heLLo', 'WORld', '123' ],
		invalid: [],
		validate: (value) => {
			const result = validate(value, uppercase(string()))
			expect(result).toBe(value.toUpperCase())
		}
	})
})
