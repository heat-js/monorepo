
import { sessionCommand } from "./session.js";

export const forgetDeviceCommand = async (client, { deviceKey }) => {
	const session = await sessionCommand(client);

	return client.call('ForgetDevice', {
		AccessToken: session.accessToken.toString(),
		DeviceKey: deviceKey,
	});
};
