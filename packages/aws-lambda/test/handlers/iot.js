
import { describe, it, expect } from 'vitest';
import { handle, iot } from "../../src";

describe('Iot', () => {

	const fn = handle(
		iot(),
		(app) => app.output = app.iot
	);

	it('should expose the iot API', async () => {
		const iot = await fn();
		expect(iot.publish).toBeDefined()
	});

});
