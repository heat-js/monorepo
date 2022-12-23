
import { test } from '../src/helper.js'

interface CacheOptions {
	maxMemoryUsageRatio?: number
	useClones?: boolean
}

const getMemoryUsage = (): number => {
	return process.memoryUsage.rss ? process.memoryUsage.rss() : process.memoryUsage().rss
}

const getMemoryLimit = (memoryLimit: number | undefined, maxMemoryUsageRatio: number): number => {
	return maxMemoryUsageRatio * parseInt(
		String(memoryLimit || process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || (test() && 1024) || 128),
		10
	)
}

interface CacheOptions {
	memoryLimit?: number
	maxMemoryUsageRatio?: number
	useClones?: boolean
}

export class Cache<Key extends string | number | symbol, Value extends unknown> {
	private index: string[] = []
	private store = new Map()
	private memoryLimit: number
	private useClones: boolean

	constructor({ memoryLimit, maxMemoryUsageRatio = 2 / 3, useClones = true }: CacheOptions = {}) {
		this.useClones = useClones
		this.memoryLimit = getMemoryLimit(memoryLimit, maxMemoryUsageRatio)
	}

	private stringify(value: unknown) {
		return this.useClones ? JSON.stringify(value) : value
	}

	private parse(value: string) {
		return this.useClones ? JSON.parse(value) : value
	}

	isOutOfMemory(): boolean {
		if (this.memoryLimit === 0) {
			return false
		}

		const rss = getMemoryUsage() / (1024 * 1024)
		return rss > this.memoryLimit
	}

	has(key: string): boolean {
		return this.store.has(key)
	}

	get(key: string): T | undefined
	get(key: string, defaultValue: T): T
	get(key: string, defaultValue?: T): T | undefined {
		if (!this.has(key)) {
			return defaultValue
		}

		const value = this.store.get(key)

		if (typeof value === 'undefined') {
			return undefined
		}

		return this.parse(value)
	}

	set(key: string, value: T) {
		if (this.isOutOfMemory()) {
			this.delete(this.index[0])
		}

		if (!this.index.includes(key)) {
			this.index.push(key)
		}

		const json = this.stringify(value)
		this.store.set(key, json)

		return this
	}

	delete(key: string): this {
		const index = this.index.indexOf(key)

		if (index > -1) {
			this.index.splice(index, 1)
		}

		this.store.delete(key)

		return this
	}

	size(): number {
		return this.store.size
	}
}
