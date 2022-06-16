# @heat/cognito [![NPM Version](https://img.shields.io/npm/v/@heat/cognito.svg)](https://www.npmjs.com/package/@heat/cognito)

Super lightweight AWS Cognito client for both the browser & nodejs. Uses the native web crypto & BigInt features in the browser & we designed the API to be tree shakable to keep the package as small as possible.

_GZip Size: ~12kB_

__The code is still a bit buggy.__

## Known Issue's
- The Cognito Login API will sometimes respond with a "incorrect username or password" error, even tho the username & password are correct. (Would love some help with fixing this bug.)

## Installation

```sh
npm install --save @heat/cognito

# using yarn:
yarn add @heat/cognito
```

# NodeJS

In nodejs you should polyfill both the webcrypto & fetch API if nodejs doesn't already support it.

```sh
import { webcrypto } from 'node:crypto';
import fetch from 'node-fetch';

globalThis.crypto = webcrypto;
globalThis.fetch = fetch;
```

# Stores

Depending on your use case you might want to use one of the following stores.

- __MemoryStore__ - Mostly used for debugging and when you don't want to persist the login token.

- __LocalStore__ - Used to store the login token on the client only.

- __CookieStore__ - The CookieStore is useful in scenarios like SSR, when you need access to the login token on the client as well as on the server. (The server will need to polyfill the fetch & web crypto API)

# Examples

## Setup

```js
import { Client, LocalStore } from '@heat/cognito';

const client = new Client({
  clientId: 'CLIENT_ID',
  userPoolId: 'USER_POOL_ID',
  store: new LocalStore()
});
```

## Sign Up

```js
import { signUpCommand, confirmSignUpCommand } from '@heat/cognito';

await signUpCommand(client, {
  email: 'EMAIL',
  username: 'USER',
  password: 'PASS',
});

// Let the user fill in his confirmation code.
await confirmSignUpCommand(client, {
  username: 'USER',
  code: 'SIGN_UP_CONFIRMATION_CODE'
})
```

## Sign In

```js
const session = await signInCommand(client, {
  username: 'USER',
  password: 'PASS',
});

// Log logged in user.
console.log(session.getUser());
```

## Sign Out

```js
await signOutCommand(client);
```

## Get Active Login Session

```js
const session = await sessionCommand(client);

// Log access token
console.log(session.accessToken.toString());

// Log ID token
console.log(session.idToken.toString());
```

## Change Password

```js
await changePasswordCommand(client, {
  previousPassword: 'PREV_PASS',
  proposedPassword: 'NEW_PASS',
});
```

## Custom Call

```js
const response = await client.call('API_NAME', {
  ...
});
```

## License

MIT
