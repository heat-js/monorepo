
const supported = typeof (window) !== 'undefined' && typeof (localStorage) !== 'undefined';

export class LocalStore {
	constructor() {
		this.serverSideData = {};
	}

	hydrate(serverSideData) {
		this.serverSideData = serverSideData;
	}

	get(key) {
		const value = supported ? localStorage.getItem(key) : this.serverSideData[key];

		if (typeof value === 'undefined') {
			return;
		}

		try {
			return JSON.parse(value);
		} catch (error) {
			return value;
		}
	}

	set(key, value) {
		const json = JSON.stringify(value);

		if (supported) {
			try {
				localStorage.setItem(key, json);
			} catch (error) {
				// storing something in localstorage can fail.
			}
		} else {
			this.serverSideData[key] = json;
		}

		return this;
	}

	remove(key) {
		if (supported) {
			localStorage.removeItem(key);
		} else {
			delete this.serverSideData[key];
		}

		return this;
	}
}
