
type Item<Value> = {
	value: Value
}

export class WeakCache<Key extends string | number | symbol, Value extends unknown> {

	private registry: FinalizationRegistry<Key>
	private cache: Map<Key, WeakRef<Item<Value>>>

	constructor() {
		this.cache = new Map()
		this.registry = new FinalizationRegistry(key => {
			this.cache.delete(key)
		})
	}

	set(key: Key, value: Value) {
		const item: Item<Value> = { value }

		this.cache.set(key, new WeakRef(item))
		this.registry.register(item, key)

	  	return this
	}

	get(key: Key): Value | undefined
	get(key: Key, defaultValue: Value): Value
	get(key: Key, defaultValue?: Value): Value | undefined {
		const ref = this.cache.get(key)
		if(ref) {
			const item = ref.deref()
			if (typeof item !== 'undefined') {
				return item.value
			}
		}

		return defaultValue
	}

	has(key: Key) {
		return typeof this.get(key) !== 'undefined'
	}

	get size() {
		return this.cache.size
	}

	* [Symbol.iterator](): IterableIterator<[ Key, Value ]> {
		for (const [ key, ref ] of this.cache) {
			const item = ref.deref()
			if (item) {
				yield [ key, item.value ]
			}
		}
	}
}
