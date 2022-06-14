
import { Client, MemoryStore, signInCommand, sessionCommand, forgetOtherDevicesCommand } from './src/index.js'
import { webcrypto } from 'node:crypto';

globalThis.crypto = webcrypto;

const deviceStore = new MemoryStore();
const store = new MemoryStore();
// store.set('device', { key: 'unknown' });

const client = new Client({
	clientId: 'CLIENT',
	userPoolId: 'USER_POOL'
});

const username = 'USER';
const password = 'PASS';

// -------------------------------------------------------------------
// The first time you login a new device will be confirmed.
await signInCommand({
	client,
	store,
	deviceStore,
	username,
	password
});

console.log('---------------------------------');
console.log('First time logged in successfully');
console.log('---------------------------------');

// -------------------------------------------------------------------
// The second time you login the device will need to be verified.
await signInCommand({
	client,
	store,
	username,
	password
});

// This log will almost never happen.
console.log('----------------------------------');
console.log('Second time logged in successfully');
console.log('----------------------------------');

// -------------------------------------------------------------------
// When your already logged in, you can get the session at any time.

const session = await sessionCommand({
	client,
	store,
});

const user = session.getUser();

console.log('----------------------------------');
console.log('User Session');
console.log(user);
console.log('----------------------------------');

// await forgetOtherDevicesCommand({
// 	client,
// 	store,
// 	deviceKey: user.deviceKey
// });


// console.log(deviceStore);
// console.log(store);
