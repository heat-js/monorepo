
import { create, StructError } from 'superstruct';
import { big, date, uuid } from "../../src/handlers/validate/types";
// import { Big } from 'big.js'

describe('Validate Types', () => {

	describe('big', () => {
		it('valid', () => {
			[0, -1, 1, '0', '1', '-1'].forEach((value) => {
				const result = create(value, big());
				expect(result.constructor.name).toBe('Big');
				expect(result.eq(value)).toBe(true);
			});
		});

		it('invalid', () => {
			[null, undefined, true, false, NaN, '', 'a', [], {}, new Date(), new Set(), new Map()].forEach((value) => {
				expect(() => {
					create(value, big());
				}).toThrow('Invalid big number');
			});
		});
	});

	describe('date', () => {
		it('valid', () => {
			[
				'1-1-2000',
				'01-01-2000',
				new Date()
			].forEach((value) => {
				const result = create(value, date());
				expect(result).toBeInstanceOf(Date);
			})
		});

		it('invalid', () => {
			[null, undefined, true, false, NaN, '', 'a', [], {}, new Set(), new Map()].forEach((value) => {
				expect(() => {
					create(value, date());
				}).toThrow(StructError);
			});
		});
	});

	describe('uuid', () => {
		it('valid', () => {
			[
				'857b3f0a-a777-11e5-bf7f-feff819cdc9f', // v1
				'9a7b330a-a736-21e5-af7f-feaf819cdc9f', // v2
				'0a7b330a-a736-35ea-8f7f-feaf019cdc00', // v3
				'c51c80c2-66a1-442a-91e2-4f55b4256a72', // v4
				'5a2de30a-a736-5aea-8f7f-ad0f019cdc00', // v5
			].forEach((value) => {
				const result = create(value, uuid());
				expect(result).toBe(value);
			})
		});

		it('invalid', () => {
			[
				null, undefined, true, false, NaN, '', 'a', [], {}, new Date(), new Set(), new Map(),
				'00000000-0000-0000-0000-000000000000',
			].forEach((value) => {
				expect(() => {
					create(value, uuid());
				}).toThrow(StructError);
			});
		});
	});

});
