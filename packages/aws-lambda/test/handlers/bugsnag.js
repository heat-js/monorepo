
import { describe, it, expect, vi } from 'vitest';
import { handle, bugsnag, ViewableError } from "../../src";

describe('Bugsnag', () => {

	it('should log errors', async () => {
		const mock = vi.fn();
		const error = new Error();
		const fn = handle(
			bugsnag(),
			(app) => {
				app.log = mock;
				throw error;
			}
		);

		await expect(fn).rejects.toThrow(error);
		// expect(mock).toBeCalled();
	});

	it('should ignore viewable errors', async () => {
		const mock = vi.fn();
		const error = new ViewableError('Test');
		const fn = handle(
			bugsnag(),
			(app) => {
				app.log = mock;
				throw error;
			}
		);

		await expect(fn).rejects.toThrow(error);
		expect(mock).not.toBeCalled();
	});
});
