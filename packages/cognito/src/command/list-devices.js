
import { sessionCommand } from "./session.js";

export const listDevicesCommand = async (client, { limit = 10, paginationToken }) => {
	const session = await sessionCommand(client);

	return client.call('ListDevices', {
		AccessToken: session.accessToken.toString(),
		Limit: limit,
		PaginationToken: paginationToken
	});
};
