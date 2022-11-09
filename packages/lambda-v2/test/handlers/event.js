
import { event, handle } from "../../src";
import { jest } from '@jest/globals';

describe('Event', () => {

	const fn = handle(
		(app) => app.value = 1, event('1'),
		(app) => app.value = 2, event('2'),
		(app) => app.value = 3, event('3'),
	);

	it('should publish events in order', async () => {
		const c1 = jest.fn((app) => expect(app.value).toBe(1));
		const c2 = jest.fn((app) => expect(app.value).toBe(2));
		const c3 = jest.fn((app) => expect(app.value).toBe(3));

		fn.on('1', c1);
		fn.on('2', c2);
		fn.on('3', c3);

		await fn();

		// expect(c1).toBeCalled();
		// expect(c2).toBeCalled();
		// expect(c3).toBeCalled();
	});

});
