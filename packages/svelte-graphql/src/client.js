
import { browser } from './utils.js';
import { GraphQLError } from './graphql-error.js';

export default class Client {
	constructor({ url, getOptions = (_) => { return {}; } }) {
		this.url = url;
		this.getOptions = getOptions;
	}

	async call({ query, variables, svFetch }) {
		const options = await this.getOptions({ query, variables, svFetch });
		const url = options.url || this.url;

		if (!browser && !svFetch) {
			throw new TypeError('No svelte fetch provided: ' + query);
		}

		const response = await (svFetch || fetch)(url, {
			method: 'POST',
			body: JSON.stringify({ query, variables }),
			...options
		});

		const result = await response.json();

		if (!response.ok || result.errors?.length) {
			throw new GraphQLError(result.errors);
		}

		return result.data;
	}
}
