
import { browser } from '$app/env';
import { writable, get } from "svelte/store";
import { getClient, getCache, register } from './global.js';
import { CACHE_FIRST, CACHE_AND_NETWORK, NO_CACHE, STORE_FIRST } from "./policy/query.js"
import { CACHE_AND_STORE, CACHE_ONLY, STORE_ONLY } from './policy/modify.js';
import ApiError from './graphql-error.js';
import parseDuration from 'parse-duration';

export const Query = (key, query, options = {}) => {

	const defaults = {
		policy: CACHE_FIRST,
		variables: undefined,
		expiresIn: 0,
		...options,
	}

	const store = writable({
		loading: false,
		data: undefined,
		errors: []
	});

	const change = (value) => {
		store.update((d) => {
			return { ...d, ...value }
		});
	}

	const load = async ({ fetch = undefined, variables = defaults.variables, policy = defaults.policy, expiresIn = defaults.expiresIn } = {}) => {
		change({ loading: true });

		try {
			const data = await getClient().call({ svFetch: fetch, query, variables });

			if (browser && [CACHE_FIRST, CACHE_AND_NETWORK].includes(policy)) {
				const expires = typeof expiresIn === 'string' ? parseDuration(expiresIn) : expiresIn;
				await getCache().set(key, variables, data, expires);
			}

			change({ loading: false, data });

			return data;

		} catch (error) {
			const errors = error instanceof ApiError ? error.errors : [error];
			change({ loading: false, errors });

			throw error;
		}
	}

	return register({
		key,
		tags: defaults.tags || [],
		type: 'query',
		load,
		subscribe: store.subscribe,
		create() {
			return Query(key, query, options);
		},
		modify: async ({ data, variables = defaults.variables, policy = CACHE_AND_STORE, expiresIn = defaults.expiresIn }) => {
			let newData = data;
			if (typeof data === 'function') {
				let cachedData;
				let storedData;

				if ([CACHE_ONLY, CACHE_AND_STORE].includes(policy)) {
					cachedData = await getCache().get(key, variables);
				}

				if ([STORE_ONLY, CACHE_AND_STORE].includes(policy)) {
					storedData = get(store).data;
				}

				newData = await data(cachedData || storedData);
			}

			if (policy === STORE_ONLY || policy === CACHE_AND_STORE) {
				store.update((d) => {
					return { ...d, data: newData };
				});
			}

			if (browser && (policy === CACHE_ONLY || policy === CACHE_AND_STORE)) {
				const expires = typeof expiresIn === 'string' ? parseDuration(expiresIn) : expiresIn;
				await getCache().set(key, variables, newData, expires);
			}
		},

		query: async (params = {}) => {
			const { variables = defaults.variables, policy = defaults.policy } = params;
			// change({ variables, data: null, errors: [] });
			change({ variables, errors: [] });

			if (browser) {
				if (policy === STORE_FIRST) {
					const { data } = get(store);

					if (typeof data !== 'undefined') {
						return data;
					}
				}

				if (policy === CACHE_FIRST || policy === CACHE_AND_NETWORK) {
					const data = await getCache().get(key, variables);

					if (typeof data !== 'undefined') {
						change({ data });

						if (policy === CACHE_FIRST) {
							return data;
						}

						if (policy === CACHE_AND_NETWORK) {
							load(params);
							return data;
						}
					}
				}
			}

			try {
				return await load(params);
			} catch (error) {
				if (!(error instanceof ApiError) || params.fetch) {
					throw error;
				}
			}
		},

		clear: async ({ policy = CACHE_AND_STORE } = {}) => {
			if (policy === CACHE_AND_STORE || policy === STORE_ONLY) {
				store.set({ data: null, loading: false, errors: [] });
			}

			if (browser && (policy === CACHE_AND_STORE || policy === CACHE_ONLY)) {
				await getCache().remove(key);
			}
		}
	});
}
