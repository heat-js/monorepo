
import { Client, CookieStore, signInCommand } from '../src/index'
import { fetch } from 'node-fetch'

globalThis.fetch = fetch;

describe('sign in flow', () => {

	const store = new CookieStore();
	const client = new Client({
		clientId: "qbe17juek4ji0v5mlj3bms54o",
		userPoolId: "eu-west-1_nO4A8A5QS"
	});

	it('login flow', async () => {
		const result = await signInCommand({
			client,
			store,
			username: 'jack',
			password: 'Doner12345!'
		});

		console.log(result);
	});
});
