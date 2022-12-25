
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
	const cache = new WeakCache<string, Item>()

	it('should set & has & get cache item', () => {
		const item = new Item()
		cache.set('test', item)

		expect(cache.has('test')).toBe(true)
		expect(cache.get('test')).toBe(item)
	})

	it('should handle undefined entries', () => {
		expect(cache.has('unknown')).toBe(false)
		expect(cache.get('unknown')).toBe(undefined)
	})

	it('should handle default value', () => {
		const defaulted = new Item()
		expect(cache.get('unknown', defaulted)).toBe(defaulted)
	})

	it('should return cache size', () => {
		expect(cache.size).toBe(1)
	})

	it('should be iterable', () => {
		const cache = new WeakCache<number, number>()
		Array.from({ length: 10 }).forEach((_, key) => {
			cache.set(key, Math.random())
		})

		expect(cache.size).toBe(10)

		for(const [key, value] of cache) {
			expect(key).toStrictEqual(expect.any(Number))
			expect(value).toStrictEqual(expect.any(Number))
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
