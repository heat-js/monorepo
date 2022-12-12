
import { Context } from 'aws-lambda'
import { test } from '../../helper'
import { Next, Request } from '../../types'

interface CacheOptions {
	maxMemoryUsageRatio?: number
	useClones?: boolean
}

export const cache = ({ maxMemoryUsageRatio = 2 / 3, useClones = true }: CacheOptions = {}) => {
	const instances = new Map()

	return (app:Request, next:Next) => {
		app.cache = <T>(namespace:string = 'default') => {
			if(!instances.has(namespace)) {
				const memoryLimit = getMemoryLimit(app.context) * maxMemoryUsageRatio
				const cache = new Cache<T>({ memoryLimit, useClones })
				instances.set(namespace, cache)

				return cache
			}

			return instances.get(namespace)
		}

		return next()
	}
}

const getMemoryLimit = (context:Context | undefined): number => {
	return parseInt(String(
		(context && context.memoryLimitInMB) ||
		process.env.CACHE_MEMORY_LIMIT ||
		(test() && 1024) ||
		128
	), 10)
}

const getMemoryUsage = (): number => {
	return process.memoryUsage.rss ?
		process.memoryUsage.rss() :
		process.memoryUsage().rss
}

export class Cache<T> {
	private index:string[] = []
	private store = new Map
	private memoryLimit: number
	private useClones: boolean

	constructor({ memoryLimit, useClones = true }: { memoryLimit: number, useClones?: boolean }) {
		this.memoryLimit = memoryLimit
		this.useClones = useClones
	}

	private stringify(value:unknown) {
		return this.useClones ? JSON.stringify(value) : value
	}

	private parse(value:string) {
		return this.useClones ? JSON.parse(value) : value
	}

	isOutOfMemory(): boolean {
		if(this.memoryLimit === 0) {
			return false
		}

		const rss = getMemoryUsage() / ( 1024 * 1024 )
		return rss > this.memoryLimit
	}

	has(key:string): boolean {
		return this.store.has(key)
	}

	get(key:string, defaultValue?:T):T | undefined {
		if(!this.has(key)) {
			return defaultValue
		}

		const value = this.store.get(key)

		if(typeof value === 'undefined') {
			return undefined
		}

		return this.parse(value)
	}

	set(key:string, value:T) {
		if(this.isOutOfMemory()) {
			this.delete(this.index[ 0 ])
		}

		if(!this.index.includes(key)) {
			this.index.push(key)
		}

		const json = this.stringify(value)
		this.store.set(key, json)

		return this
	}

	delete(key:string) : this {
		const index = this.index.indexOf(key)

		if(index > -1) {
			this.index.splice(index, 1)
		}

		this.store.delete(key)

		return this
	}

	size() : number {
		return this.store.size
	}
}
