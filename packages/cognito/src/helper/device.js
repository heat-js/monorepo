
export const getUserDevice = (client, username) => {
	const deviceStore = client.getDeviceStore();
	const store = client.getStore();

	if (deviceStore) {
		const device = deviceStore.get(`device.${username}`);
		if (device) {
			store.set('device', device);
			return device;
		}
	}

	return store.get('device') || {};
}

export const setUserDevice = (client, username, device) => {
	const deviceStore = client.getDeviceStore();

	if (deviceStore) {
		deviceStore.set(`device.${username}`, device);
	}

	client.getStore().set('device', device);
}

export const removeUserDevice = (client, username) => {
	const deviceStore = client.getDeviceStore();

	if (deviceStore) {
		deviceStore.remove(`device.${username}`);
	}

	return client.getStore().remove('device');
}
