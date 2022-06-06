
import { Client, MemoryStore, signInCommand, sessionCommand } from './src/index.js'
import { webcrypto } from 'node:crypto';

globalThis.crypto = webcrypto;

const store = new MemoryStore();
const client = new Client({
	clientId: 'CLIENT_ID',
	userPoolId: 'USER_POOL_ID'
});

const username = 'USER';
const password = 'PASS';

// -------------------------------------------------------------------
// The first time you login a new device will be confirmed.
await signInCommand({
	client,
	store,
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

console.log('----------------------------------');
console.log('User Session');
console.log(session.getUser());
console.log('----------------------------------');
