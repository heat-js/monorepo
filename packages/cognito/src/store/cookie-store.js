
import cookie from 'js-cookie';

const browser = typeof (window) !== 'undefined';

export class CookieStore {
	constructor() {
		this.serverSideData = {};
	}

	hydrate(serverSideData) {
		this.serverSideData = serverSideData;
	}

	get(key) {
		const value = browser ? cookie.get(name) : this.serverSideData[key];

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

		if (browser) {
			cookie.set(key, json, {
				secure: location.hostname !== 'localhost',
				expires: 3650,
				sameSite: 'strict',
			});
		} else {
			this.serverSideData[key] = value;
		}

		return this;
	}

	remove(key) {
		if (browser) {
			cookie.remove(key);
		} else {
			delete this.serverSideData[key];
		}

		return this;
	}
}
