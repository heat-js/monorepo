# @heat/svelte-graphql [![NPM Version](https://img.shields.io/npm/v/@heat/svelte-graphql.svg)](https://www.npmjs.com/package/@heat/svelte-graphql)

Lightweight Graphql Client for svelte kit.

## Installation

```sh
npm install --save @heat/svelte-graphql

# using yarn:
yarn add @heat/svelte-graphql
```

# Setup

Use the vite plugin to automaticly transform graphql files.

```js
import { sveltekit } from '@sveltejs/kit/vite';
import { graphql } from '@heat/svelte-graphql/vite';

export default {
  plugins: [
    sveltekit(),
    graphql(),
  ]
}
```

Setup the graphql client & cache.

```js
import { initClient, initCache, IndexedDBCache } from '@heat/svelte-graphql';
import { browser } from '$app/env';

const cache = new IndexedDBCache();
if (browser) {
  cache.init();
}

initCache(cache);

initClient({
  getOptions: async ({ svFetch }) => {
    return {
      url: `https://localhost/graphql`,
      headers: {
        'Api-Key': await getApiKey({ svFetch }),
      }
    }
  }
});

```

# Cache

Depending on your use case you might want to use one of the following caches.

- __InMemoryCache__ - Mostly used for debugging and when you don't want to persist your graphql responses.

- __IndexedDBCache__ - Used to cache your graphql responses the login token on the client only.

# Examples

Your graphql files will compile to a JS where each query inside your graphql files will be exported and transformed to a special svelte store.

_File: query.gql_

```graphql
query Product ($id: Int) {
  product(id: $id) {
    title
    description
  }
}

query RealTime @params(policy:"no-cache") {
  exchangeRates {
    currency
    value
  }
}

mutation CreateProduct ($title: String!, $description: String!) {
  createProduct(title: $title, description: $description) {
    id
  }
}
```

## Product Page

```html
<script context="module">
  export async function load({ fetch, params }) {
    try {
      product.query({
          fetch,
          variables: {
            id: params.id
          }
        });
    } catch (error) {
      return {
        status: 400
      };
    }
  }
</script>

<script>
  import { product } from './query.gql';
</script>

<h1>{$product.data.product.title}</h1>
<h2>{$product.data.product.description}</h2>
```

## Create Product Page

```html
<script>
  import { createProduct } from './query.gql';

  const create = async () => {
    const result = await createProduct.mutate({
      variables: {
        title: 'Hello',
        description: 'World',
      }
    });
  }
</script>

{#if $createProduct.loading}
  <p>Creating...</p>
{/if}

<button on:click={create}>
  Create
</button>
```

# API

# Query Store

## `query({ [ variables, policy, expiresIn ] } = {})`
Fetch the query from the server.

Possible policies can be:
  - STORE_FIRST
  - CACHE_FIRST
  - CACHE_AND_NETWORK
  - NETWORK_ONLY
  - NO_CACHE

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variables` | `object` | `{}` | The variables used in the query |
| `policy` | `string` | `'cache-and-network'` | The fetch policy |
| `expiresIn` | `number\|string` | `undefined` | The expire time in milliseconds for the cached data. |

## `modify({ data, [ variables, policy, expiresIn ] } = {})`
Modify the data in the store and/or the cache.

Possible policies can be:
  - CACHE_AND_STORE
  - CACHE_ONLY
  - STORE_ONLY

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `data` | `object\|function` | `undefined` | The data replacement for the store and/or cache |
| `variables` | `object` | `{}` | The variables used for the cache key |
| `policy` | `string` | `'cache-and-store'` | The policy for modifing the store and/or cache. |
| `expiresIn` | `number\|string` | `undefined` | The expire time in milliseconds for the cached data. |

## `clear({ [ policy ] } = {})`
Clear the data in the store and/or the cache.

Possible policies can be:
  - CACHE_AND_STORE
  - CACHE_ONLY
  - STORE_ONLY

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `policy` | `string` | `'cache-and-store'` | The policy for clearing the store and/or cache. |


# Mutation Store

## `mutate({ [ variables, suppressError ] } = {})`
Clear the data in the store.

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variables` | `object` | `{}` | The variables used in the mutation |
| `suppressError` | `boolean` | `false` | Don't throw error's if the mutation fails |

## `clear()`
Clear the data in the store.
