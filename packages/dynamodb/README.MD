[![npm version](https://img.shields.io/npm/dw/@heat/dynamodb)](https://www.npmjs.org/package/@heat/dynamodb)
[![npm version](https://img.shields.io/npm/v/@heat/dynamodb.svg?style=flat-square)](https://www.npmjs.org/package/@heat/dynamodb)
[![license](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE)

# @heat/dynamodb

The @heat/dynamodb package provides a small and tree-shakable layer around aws-sdk v3, to make working with the DynamoDB API super simple.


## Setup

Install with (NPM):

```
npm i @heat/dynamodb
```


## Basic Usage

```ts
import { putItem, getItem, ql, ... } from '@heat/dynamodb';

type Post = {
	id: number
	user: number
	title: string
}

// Insert a post into the posts table
await putItem<Post>('posts', {
	id: 1,
	user: 1,
	title: 'Hello World'
})

// Get a post from the posts table
const user = await getItem<Post>('posts', { user: 1, id: 1 })

// Update a post in the posts table
await updateItem('posts', { user: 1, id: 1 }, {
	update: ql`SET #title = ${ 'Hi...' }`
})

// Delete a post in the posts table
await deleteItem('posts', { user: 1, id: 1 })

// List posts from user 1
const { items, cursor } = await query<Post>('posts', {
	keyCondition: ql`#userId = ${1}`
})

// List posts from user 1 but with stringified cursors
const { items, cursor } = await pagination<Post>('posts', {
	keyCondition: ql`#userId = ${1}`
})

// List all posts
const { items, cursor } = await scan<Post>('posts')

// Write a transaction
await transactWrite({
	items: [
		transactConditionCheck('posts', { userId: 1, id: 0 }, {
			condition: ql`attribute_not_exists(#id)`
		}),

		transactPut<Post>('posts', { userId: 1, id: 1, title: 'Post 1' }),
		transactPut<Post>('posts', { userId: 1, id: 2, title: 'Post 2' }),
		transactPut<Post>('posts', { userId: 1, id: 3, title: 'Post 3' }),
	]
})
```

## License

MIT
