
import { handle, bugsnag, ViewableError } from "../../src";
import { jest } from '@jest/globals';

describe('Bugsnag', () => {

	it('should log errors', async () => {
		const mock = jest.fn();
		const error = new Error();
		const fn = handle(
			bugsnag(),
			(app) => {
				app.log = mock;
				throw error;
			}
		);

		await expect(fn).rejects.toThrow(error);
		expect(mock).toBeCalled();
	});

	it('should ignore viewable errors', async () => {
		const mock = jest.fn();
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
