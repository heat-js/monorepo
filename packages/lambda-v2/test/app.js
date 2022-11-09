
import { createApp } from "../src";

describe('App', () => {

	const App = () => {
		return createApp(undefined, {}, () => { });
	}

	it('should create a singleton instance', async () => {
		const app = App();
		let instance = 0;

		app.$.test = () => ++instance;

		expect(app.test).toBe(1);
		expect(app.test).toBe(1);
	});

	it('should allow direct instance assignment', async () => {
		const app = App();
		app.test = 'value';

		expect(app.test).toBe('value');
	});

	it('should known if a instance has been created', async () => {
		const app = App();
		expect(app.has('service')).toBe(false);

		app.$.service = () => 'value';
		expect(app.has('service')).toBe(false);

		app.service;
		expect(app.has('service')).toBe(true);

		app.service2 = 'value';
		expect(app.has('service2')).toBe(true);
	});

	it('should invalidate instance', async () => {
		const app = App();

		app.service = 'value';
		expect(app.has('service')).toBe(true);

		delete app.service;
		expect(app.has('service')).toBe(false);
	});

	it('should handle factory errors', async () => {
		const app = App();
		const error = new Error('Test error');

		app.$.test = () => { throw error };

		expect(() => app.test).toThrow(error);
	});
});
