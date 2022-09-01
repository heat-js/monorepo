
import CacheItem from "./Item";

export class LocalStorageCache {
	constructor() {
		this.cache = {};
	}

	set(ns, variables, value, expiresIn = 0) {
		const key = JSON.stringify([ns, variables]);
		const expires = expiresIn > 0 ? Date.now() + expiresIn : 0;
		const item = new CacheItem({ value, expires });

		localStorage.setItem(key, item.toString());

		// if (this.cache[query]) {
		// 	this.cache[query][key] = item;
		// } else {
		// 	this.cache[query] = { [key]: item };
		// }
	}

	get(ns, variables) {
		const key = JSON.stringify([ns, variables]);
		const raw = localStorage.getItem(key);
		if (!raw) return;

		const item = CacheItem.parse(raw);

		if (item.isValid()) {
			return item.value;
		}
	}

	remove(ns) {
		// delete this.cache[query];
	}

	clear() {
		// this.cache = {};
	}
}
