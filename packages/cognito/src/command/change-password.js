
import { sessionCommand } from "./session.js";

export const changePasswordCommand = async ({ client, store, previousPassword, proposedPassword }) => {
	const session = await sessionCommand({ client, store });

	return client.call('ChangePassword', {
		PreviousPassword: previousPassword,
		ProposedPassword: proposedPassword,
		AccessToken: session.accessToken.toString(),
	});
};
