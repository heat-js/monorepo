
export const getUserDevice = ({ store, deviceStore, username }) => {
	if (deviceStore) {
		const device = deviceStore.get(`device.${username}`);
		if (device) {
			store.set('device', device);
			return device;
		}
	}

	return store.get('device') || {};
}

export const setUserDevice = ({ store, deviceStore, username, device }) => {
	if (deviceStore) {
		deviceStore.set(`device.${username}`, device);
	}

	store.set('device', device);
}

export const removeUserDevice = ({ store, deviceStore, username }) => {
	if (deviceStore) {
		deviceStore.remove(`device.${username}`);
	}

	return store.remove('device');
}
