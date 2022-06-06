# @heat/cognito [![NPM Version](https://img.shields.io/npm/v/@heat/cognito.svg)](https://www.npmjs.com/package/@heat/cognito)

Lightweight AWS Cognito client package for the browser. Uses the native web crypto & BigInt features in the browser & designed the API to be tree shakable to keep the package as small as possible.

_GZip Size: ~10kB_

__The code is still a bit buggy.__

## Installation

```sh
npm install --save @heat/cognito

# using yarn:
yarn add @heat/cognito
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

const store = new LocalStore();
const client = new Client({
  clientId: 'CLIENT_ID',
  userPoolId: 'USER_POOL_ID'
});
```

## Sign Up

```js
import { signUpCommand, confirmSignUpCommand } from '@heat/cognito';

await signUpCommand({
  client,
  store,
  email: 'EMAIL',
  username: 'USER',
  password: 'PASS',
});

// Let the user fill in his confirmation code.
await confirmSignUpCommand({
  client,
  username: 'USER',
  code: 'SIGN_UP_CONFIRMATION_CODE'
})
```

## Sign In

```js
const session = await signInCommand({
  client,
  store,
  username: 'USER',
  password: 'PASS',
});

// Log logged in user.
console.log(session.getUser());
```

## Sign Out

```js
await signOutCommand({ client, store });
```

## Get Active Login Session

```js
const session = await sessionCommand({ client, store });

// Log access token
console.log(session.accessToken.toString());
```

## Change Password

```js
await changePasswordCommand({
  client,
  store,
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
