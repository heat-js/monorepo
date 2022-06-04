
export class MemoryStore {
	constructor() {
		this.data = {};
	}

	hydrate(data) {
		this.data = data;
	}

	get(key) {
		return this.data[key];
	}

	set(key, value) {
		this.data[key] = value;
		return this;
	}

	remove(key) {
		delete this.data[key];
		return this;
	}
}
