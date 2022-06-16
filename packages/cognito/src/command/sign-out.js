import Unauthorized from "../error/unauthorized.js";
import { sessionCommand } from "./session.js";

const removeLocalState = (client) => {
	const store = client.getStore();
	store.remove('token');

	if (client.getDeviceStore()) {
		store.remove('device');
	}
}

export const signOutCommand = async (client) => {
	let session;
	try {
		session = await sessionCommand(client)
	} catch (error) {
		if (error instanceof Unauthorized) {
			removeLocalState(client);
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
			removeLocalState(client);
			return;
		}

		throw error;
	}

	removeLocalState(client);
};
