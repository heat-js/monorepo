
import { describe, it, expect } from 'vitest';
import { handle, cache, Cache } from "../../src";

describe('Cache', () => {

	const store = new Cache({
		memoryLimit: 1000,
		useClones: true
	});

	it('should have correct initial behavior', () => {
		expect(store.size()).toBe(0);
		expect(store.has('key')).toBe(false);
		expect(store.get('key')).toBe(undefined);
	});

	it('should set key correctly', () => {
		store.set('key', true);
		expect(store.size()).toBe(1);
		expect(store.has('key')).toBe(true);
		expect(store.get('key')).toBe(true);
	});

	it('should delete item', () => {
		store.delete('key');
		expect(store.size()).toBe(0);
		expect(store.has('key')).toBe(false);
		expect(store.get('key')).toBe(undefined);
	});

	it('should get copy of the data', () => {
		const value = {};
		store.set('key', value);
		expect(store.get('key')).not.toBe(value);
	});

	it('should not copy of the data with cloning off', () => {
		const value = {};
		const store = new Cache({ memoryLimit: 1000, useClones: false });

		store.set('key', value);
		expect(store.get('key')).toBe(value);
	});

	it('should remove values after memory limit is reached', () => {
		const store = new Cache({ memoryLimit: 0.01, useClones: true });

		store.set('1', true);
		expect(store.size()).toBe(1);

		store.set('2', true);
		expect(store.size()).toBe(1);
		expect(store.has('1')).toBe(false);
	});

	it('should be able to disable memory limit', () => {
		const store = new Cache({ memoryLimit: 0, useClones: true });
		let count = 100;

		while (count--) {
			store.set(count, true);
		}

		expect(store.size()).toBe(100);
	});

	it('should set & get cache item', async () => {
		const middleware = cache();

		const setter = handle(middleware, (app) => {
			app.cache().set('key', app.input);
		});

		const getter = handle(middleware, (app) => {
			app.output = app.cache().get('key');
		});

		await setter(true);
		const result = await getter();

		expect(result).toBe(true);
	});
});
