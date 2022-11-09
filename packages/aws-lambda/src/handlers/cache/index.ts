
import { IApp } from '../../app'
import { Next } from '../../compose'
import { test } from '../../helper';

interface CacheOptions {
	maxMemoryUsageRatio?: number;
	useClones?: boolean;
}

export const cache = ({ maxMemoryUsageRatio = 2 / 3, useClones = true }: CacheOptions = {}) => {
	const instances = new Map();

	return (app:IApp, next:Next) => {
		app.cache = (namespace:string = 'default') => {
			if(!instances.has(namespace)) {
				const memoryLimit = getMemoryLimit(app.context) * maxMemoryUsageRatio;
				const cache = new Cache({ memoryLimit, useClones });
				instances.set(namespace, cache);

				return cache;
			}

			return instances.get(namespace);
		}

		return next();
	}
}

const getMemoryLimit = (context) => {
	return (
		context.memoryLimitInMB ||
		process.env.CACHE_MEMORY_LIMIT ||
		(test() && 1024) ||
		128
	)
}

const getMemoryUsage = () => {
	return process.memoryUsage.rss ?
		process.memoryUsage.rss() :
		process.memoryUsage().rss;
}

export class Cache {
	private index = [];
	private store = new Map;
	private memoryLimit?: number;
	private useClones: boolean;

	constructor({ memoryLimit, useClones }) {
		this.memoryLimit = memoryLimit;
		this.useClones = useClones;
	}

	private stringify(value) {
		return this.useClones ? JSON.stringify(value) : value;
	}

	private parse(value) {
		return this.useClones ? JSON.parse(value) : value;
	}

	isOutOfMemory() {
		if(this.memoryLimit === 0) {
			return false;
		}

		const rss = getMemoryUsage() / ( 1024 * 1024 );
		return rss > this.memoryLimit;
	}

	has(key:string): boolean {
		return this.store.has(key);
	}

	get(key:string, initialValue?) {
		if(!this.has(key)) {
			return initialValue;
		}

		const value = this.store.get(key);

		if(typeof value === 'undefined') {
			return undefined;
		}

		return this.parse(value);
	}

	set(key:string, value:any) {
		if(this.isOutOfMemory()) {
			this.delete(this.index[ 0 ]);
		}

		if(!this.index.includes(key)) {
			this.index.push(key);
		}

		const json = this.stringify(value);
		this.store.set(key, json);

		return this;
	}

	delete(key:string) {
		const index = this.index.indexOf(key);

		if(index > -1) {
			this.index.splice(index, 1);
		}

		this.store.delete(key);

		return this;
	}

	size() {
		return this.store.size
	}
}
