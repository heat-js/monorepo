
import { describe, it, expect } from 'vitest'
import { handle } from "../src";

describe('Handle', () => {

	it('should echo', async () => {
		const lambda = handle((app) => app.output = app.input);
		expect(lambda.app).toBeUndefined();

		const result = await lambda('echo');

		expect(result).toBe('echo');
		expect(lambda.app).toBeDefined();
		expect(lambda.on).toBeDefined();
		expect(lambda.emit).toBeDefined();
	});

	it('should noop', async () => {
		const lambda = handle();
		const result = await lambda('echo');

		expect(result).toBeUndefined();
	});

	it('should throw #1', async () => {
		const error = new Error();
		const lambda = handle(() => { throw error });

		await expect(lambda()).rejects.toThrow(error);
	});

	it('should throw #2', async () => {
		const error = new Error();
		const lambda = handle(
			async (app, next) => {
				app.$.test = () => { throw error }
				await next();
			},
			(app) => app.test,
		);

		await expect(lambda()).rejects.toThrow(error);
	});
});
