
import { Client, CookieStore, signInCommand } from './src/index.js'

const username = 'jack';
const password = 'Doner12345!';
const store = new CookieStore();
const client = new Client({
	clientId: 'qbe17juek4ji0v5mlj3bms54o',
	userPoolId: 'eu-west-1_nO4A8A5QS'
});

// -------------------------------------------------------------------
// The first time you login a new device will be confirmed.
const result = await signInCommand({
	client,
	store,
	username,
	password
});

console.info('----------------------------------');
console.info('First time logged in successfully');
console.info('----------------------------------');


// -------------------------------------------------------------------
// The second time you login the device will need to be verified.
const result2 = await signInCommand({
	client,
	store,
	username,
	password
});

// This log will almost never happen.
console.info('----------------------------------');
console.log('Second time logged in successfully');
console.info('----------------------------------');
