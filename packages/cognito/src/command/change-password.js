
import { sessionCommand } from "./session.js";

export const changePasswordCommand = async (client, { previousPassword, proposedPassword }) => {
	const session = await sessionCommand(client);

	return client.call('ChangePassword', {
		PreviousPassword: previousPassword,
		ProposedPassword: proposedPassword,
		AccessToken: session.accessToken.toString(),
	});
};
