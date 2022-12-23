
interface Factories {
	[key: string | symbol]: () => any
}

export interface Container {
	readonly $: Factories
	readonly has:(key: string | symbol) => boolean

	[key: string | symbol]: any
}

export const container = <T extends { [key:string]: any }>(defaults:T): Container & T => {
	const instances = new Map<string | symbol, any>()
	const factories = new Map<string | symbol, () => any>()
	const $ = new Proxy<Factories>({}, {
		set(_, key, value) {
			factories.set(key, value)
			return true
		}
	})

	const has = (key: string | symbol) => {
		return instances.has(key)
	}

	const container: Container & T = { $, has, ...defaults }

	return new Proxy(container, {
		deleteProperty(_, key) {
			instances.delete(key)
			return true
		},
		set(_, key, value) {
			instances.set(key, value)
			return true
		},
		get(_, key) {
			if(key in container) {
				return container[key]
			}

			if(instances.has(key)) {
				return instances.get(key)
			}

			const factory = factories.get(key)

			if(!factory) {
				throw new TypeError(`"${ key.toString() }" container factory function not found.`)
			}

			const value = factory()

			instances.set(key, value)
			return value
		}
	})
}
