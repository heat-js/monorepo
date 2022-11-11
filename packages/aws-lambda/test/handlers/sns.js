
import { describe, it, expect } from 'vitest';
import { handle, sns } from "../../src";

describe('SNS', () => {

	const fn = handle(
		sns(),
		(app) => app.output = app.sns
	);

	it('should expose the API', async () => {
		const api = await fn();
		expect(api.publish).toBeDefined()
	});

});
