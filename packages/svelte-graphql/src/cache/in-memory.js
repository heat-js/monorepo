
const isValid = (item) => {
	return item && (!item.expires || Date.now() < item.expires);
}

export class InMemoryCache {
	constructor() {
		this.cache = {};
	}

	set(ns, variables, value, expiresIn = 0) {
		const key = JSON.stringify(variables);
		const expires = expiresIn > 0 ? Date.now() + expiresIn : 0;
		const item = { value, expires };

		if (this.cache[ns]) {
			this.cache[ns][key] = item;
		} else {
			this.cache[ns] = { [key]: item };
		}
	}

	get(ns, variables) {
		const key = JSON.stringify(variables);
		const item = this.cache[ns] && this.cache[ns][key];

		if (isValid(item)) {
			return item.value;
		}
	}

	remove(ns) {
		delete this.cache[ns];
	}

	clear() {
		this.cache = {};
	}
}
