
import { Client, MemoryStore, signInCommand, sessionCommand } from './src/index.js'
import { webcrypto } from 'node:crypto';

globalThis.crypto = webcrypto;

const deviceStore = new MemoryStore();
const store = new MemoryStore();

const client = new Client({
	clientId: 'qbe17juek4ji0v5mlj3bms54o',
	userPoolId: 'eu-west-1_nO4A8A5QS',
	store,
	deviceStore,
});

const username = 'jack';
const password = 'Testtest123!';

// -------------------------------------------------------------------
// The first time you login a new device will be confirmed.

await signInCommand(client, {
	username,
	password,
});

console.log('---------------------------------');
console.log('First time logged in successfully');
console.log('---------------------------------');

// -------------------------------------------------------------------
// The second time you login the device will need to be verified.
await signInCommand(client, {
	username,
	password
});

console.log('----------------------------------');
console.log('Second time logged in successfully');
console.log('----------------------------------');

// -------------------------------------------------------------------
// When your already logged in, you can get the session at any time.

const session = await sessionCommand(client);

const user = session.getUser();

console.log('----------------------------------');
console.log('User Session');
console.log(user);
console.log('----------------------------------');
