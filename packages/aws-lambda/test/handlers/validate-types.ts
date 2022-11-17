
import { describe, it, expect } from 'vitest'
import { create, StructError } from 'superstruct'
import { big, date, uuid, positive, percision } from '../../src/handlers/validate/types'
import Big from 'big.js'

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
					expect(() => validate(value)).toThrow(StructError)
				})
			})
		})
	}

	testRule('big', {
		valid: [0, -1, 1, '0', '1', '-1', Big(1)],
		invalid: [null, undefined, true, false, NaN, '', 'a', [], {}, new Date(), new Set(), new Map()],
		validate: (value) => {
			const result = create(value, big())
			expect(result.constructor.name).toBe('Big')
			expect(result.eq(value)).toBe(true)
		}
	})

	testRule('big positive', {
		valid: [1, 100, 1000],
		invalid: [0, -1, -100, -1000],
		validate: (value) => {
			const result = create(value, positive(big()))
			expect(result.eq(value)).toBe(true)
		}
	})

	testRule('big percision', {
		valid: [0, 1, 100, 1000, 0.01, 100.01],
		invalid: [0.001, 100.0001],
		validate: (value) => {
			const result = create(value, percision(big(), 2))
			expect(result.eq(value)).toBe(true)
		}
	})

	testRule('date', {
		valid: [ '1-1-2000', '01-01-2000', new Date() ],
		invalid: [null, undefined, true, false, NaN, '', 'a', [], {}, new Set(), new Map()],
		validate: (value) => {
			const result = create(value, date())
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
			const result = create(value, uuid())
			expect(result).toBe(value)
		}
	})

})
