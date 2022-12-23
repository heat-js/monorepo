
import { randomBytes } from 'crypto'
import { describe, it } from 'vitest'
import { WeakCache } from '../../src'

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

	it('should handle extreemly large inserts', async () => {
		const limit = 100000
		const cache = new WeakCache<number, Buffer>()
		const random = (size:number): Promise<Buffer> => new Promise((resolve, reject) => {
			randomBytes(size, (error, buffer) => {
				if(error) {
					reject(error)
				} else {
					resolve(buffer)
				}
			})
		})

		await Promise.all(Array.from({ length: limit }).map(async (_, index) => {
			const item = await random(1000)
			cache.set(index, item)
		}))

		expect(cache.size).toBe(limit)
	})

})
