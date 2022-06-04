import Unauthorized from "../error/unauthorized.js";
import { sessionCommand } from "./session.js";

export const signOutCommand = async ({ client, store }) => {
	let session;
	try {
		session = await sessionCommand({ client, store })
	} catch (error) {
		if (error instanceof Unauthorized) {
			store.remove('token');
			return;
		}

		throw error;
	}

	try {
		await client.call('GlobalSignOut', {
			AccessToken: session.accessToken.toString()
		});
	} catch (error) {
		if (error.code === 'NotAuthorizedException') {
			store.remove('token');
			return;
		}

		throw error;
	}

	store.remove('token');
	store.remove('device');
};
