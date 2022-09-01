
import Client from "./client.js"

let client;
let cache;
let stores = {};

export const getCache = () => cache;
export const initCache = (c) => cache = c;

export const getClient = () => client;
export const initClient = (params) => client = new Client(params);

export const register = (store) => {
	// stores.push(store);
	if (!stores[store.key]) {
		stores[store.key] = store;
	}

	return store;
};

export const getStores = () => {
	return Object.values(stores);
};
