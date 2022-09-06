
import Dexie from "dexie";

const isValid = (item) => {
	return item && (item.expires === -1 || Date.now() < item.expires);
}

const supress = async (callback) => {
	try {
		await callback();
	} catch (error) {
		if (['TimeoutError', 'InvalidStateError', 'AbortError'].includes(error.name)) {
			return;
		}

		throw error;
	}
}

export class IndexedDBCache {

	_cacheId(ns, variables) {
		if (typeof variables === 'object') {
			return ns + '-' + JSON.stringify(variables);
		}

		return ns;
	}

	async init() {
		this.db = new Dexie('ApiCache');
		this.db.version(1).stores({ cache: 'id,ns,expires' });

		// remove expired cached records
		await supress(() => {
			return this.db.cache.where('expires')
				.between(0, Date.now())
				.delete()
		});
	}

	async set(ns, variables, value, expiresIn = 0) {
		const id = this._cacheId(ns, variables);
		const expires = expiresIn > 0 ? Date.now() + expiresIn : -1;

		await supress(() => {
			return this.db.cache.put({
				id,
				ns,
				value,
				expires
			});
		});
	}

	async get(ns, variables) {
		const id = this._cacheId(ns, variables);
		const item = await this.db.cache.get({ id });

		if (isValid(item)) {
			return item.value;
		}
	}

	async remove(ns) {
		await supress(() => {
			return this.db.cache.where({ ns }).delete();
		});
	}

	async clear() {
		await supress(() => {
			return this.db.cache.clear();
		});
	}
};
