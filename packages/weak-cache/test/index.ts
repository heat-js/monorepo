
import { describe, it } from 'vitest'
import { WeakCache } from '../src'
import gc from 'expose-gc'

const sleep = () => new Promise(resolve => setTimeout(resolve, 10))

const runGC = async () => {
	await sleep()
	await gc()
	await sleep()
}

describe('Weak Cache', () => {

	class Item {}

	it('should set & has & get cache item', () => {
		const cache = new WeakCache<string, Item>()
		const item = new Item()
		cache.set('test', item)

		expect(cache.has('test')).toBe(true)
		expect(cache.get('test')).toBe(item)
	})

	it('should handle undefined entries', () => {
		const cache = new WeakCache<string, number>()
		expect(cache.has('unknown')).toBe(false)
		expect(cache.get('unknown')).toBe(undefined)
	})

	it('should handle default value', () => {
		const cache = new WeakCache<string, string>()
		expect(cache.get('unknown', 'defaulted')).toBe('defaulted')
	})

	it('should return cache size', () => {
		const cache = new WeakCache<number, number>()
		cache.set(1, 1)
		expect(cache.size).toBe(1)
	})

	it('should delete cache item', () => {
		const cache = new WeakCache<number, number>()
		cache.set(1, 1)
		cache.delete(1)
		expect(cache.size).toBe(0)
	})

	it('should clear cache', () => {
		const cache = new WeakCache<number, number>()
		cache.set(1, 1)
		cache.set(2, 1)
		cache.set(3, 1)
		cache.clear()
		expect(cache.size).toBe(0)
	})

	it('should be iterable', () => {
		const cache = new WeakCache<number, string>()
		Array.from({ length: 10 }).forEach((_, key) => {
			cache.set(key, String(Math.random()))
		})

		expect(cache.size).toBe(10)

		for(const [key, value] of cache) {
			expect(key).toStrictEqual(expect.any(Number))
			expect(value).toStrictEqual(expect.any(String))
		}

		for(const [key, value] of cache.entries()) {
			expect(key).toStrictEqual(expect.any(Number))
			expect(value).toStrictEqual(expect.any(String))
		}

		for(const key of cache.keys()) {
			expect(key).toStrictEqual(expect.any(Number))
		}

		for(const value of cache.values()) {
			expect(value).toStrictEqual(expect.any(String))
		}
	})

	it('should clean up when garbage collection runs', async () => {
		const limit = 10000
		const cache = new WeakCache<number, number>()

		Array.from({ length: limit }).forEach((_, key) => {
			cache.set(key, Math.random())
		})

		expect(cache.size).toBe(limit)

		await runGC()

		expect(cache.size).toBe(0)
	})
})
