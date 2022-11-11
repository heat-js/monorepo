
import { describe, it, expect } from 'vitest'
import { handle, validate } from "../../src";
import { number, string, object, date } from 'superstruct';

describe('Validate', () => {

	const rules = {
		id: string(),
		amount: number(),
		createdAt: date(),
	}

	it('should validate valid data', async () => {
		const fn = handle(
			validate(object({
				id: rules.id,
				amount: rules.amount,
				createdAt: rules.createdAt,
			}))
		);

		await fn({
			id: '1',
			amount: 1,
			createdAt: new Date()
		})
	});

	it('should throw for invalid data', async () => {
		const fn = handle(
			validate(object({
				id: rules.id,
				amount: rules.amount,
				createdAt: rules.createdAt,
			}))
		);

		await expect(fn({
			id: 1,
		})).rejects.toThrow(Error);
	});

});
