import Unauthorized from "../error/unauthorized.js";
import { sessionCommand } from "./session.js";

const removeLocalState = ({ store, deviceStore }) => {
	store.remove('token');
	if (deviceStore) {
		store.remove('device');
	}
}

export const signOutCommand = async ({ client, store, deviceStore }) => {
	let session;
	try {
		session = await sessionCommand({ client, store })
	} catch (error) {
		if (error instanceof Unauthorized) {
			removeLocalState({ store, deviceStore });
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
			removeLocalState({ store, deviceStore });
			return;
		}

		throw error;
	}

	removeLocalState({ store, deviceStore });
};
