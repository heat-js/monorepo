
import { sessionCommand } from "./session.js";

export const listDevicesCommand = async ({ client, store, limit = 10, paginationToken }) => {
	const session = await sessionCommand({ client, store });

	return client.call('ListDevices', {
		AccessToken: session.accessToken.toString(),
		Limit: limit,
		PaginationToken: paginationToken
	});
};
