
import { sessionCommand } from "./session.js";

export const forgetDeviceCommand = async ({ client, store, deviceKey }) => {
	const session = await sessionCommand({ client, store });

	return client.call('ForgetDevice', {
		AccessToken: session.accessToken.toString(),
		DeviceKey: deviceKey,
	});
};
