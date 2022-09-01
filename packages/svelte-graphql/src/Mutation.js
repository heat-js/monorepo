
import { writable } from "svelte/store";
import { getClient, register } from './global.js';
import { GraphQLError } from './graphql-error.js';

export const Mutation = (key, query) => {
	const { update, set, subscribe } = writable({
		loading: false,
		data: null,
		errors: []
	});

	const change = (value) => {
		update((d) => {
			return { ...d, ...value }
		});
	}

	return register({
		key,
		type: 'mutation',
		subscribe,

		create() {
			return Mutation(key, query);
		},

		// modify: (fnOrData) => {
		// 	update((d) => {
		// 		// return { ...d, data: callback(d.data) };
		// 		return { ...d, data: typeof fnOrData === 'function' ? fnOrData(d.data) : fnOrData };
		// 	})
		// },

		mutate: async ({ variables = undefined, suppressError = false } = {}) => {
			change({ variables, loading: true });

			try {
				const data = await getClient().call({ query, variables });
				change({ loading: false, data, errors: [] });

				return data;

			} catch (error) {
				const errors = error instanceof GraphQLError ? error.errors : [error];
				change({ loading: false, data: null, errors });

				if (!suppressError) {
					throw error;
				}
			}
		},

		clear: () => {
			set({ data: null, loading: false, errors: [] });
		}
	});
}
