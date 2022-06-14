
import { forgetDeviceCommand } from "./forget-device.js";
import { listDevicesCommand } from "./list-devices.js";

export const forgetOtherDevicesCommand = async ({ client, store, deviceKey }) => {
	const devices = [];
	let paginationToken;

	while (true) {
		const result = await listDevicesCommand({
			client,
			store,
			limit: 60,
			paginationToken
		});

		paginationToken = result.PaginationToken;

		result.Devices.forEach((item) => {
			if (deviceKey !== item.DeviceKey) {
				devices.push(item.DeviceKey);
			}
		})

		if (!paginationToken) {
			break;
		}
	}

	return Promise.all(devices.map(deviceKey => {
		return forgetDeviceCommand({
			client,
			store,
			deviceKey
		});
	}));
};
