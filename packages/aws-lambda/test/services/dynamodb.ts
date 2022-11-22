
import { describe, it, expect } from 'vitest'
import { Table, getItem, putItem, query, ql } from '../../src/services/dynamodb/index'
// import { startDynamo } from '@heat/test'

describe('DynamoDB', () => {

	// const dynamo = startDynamo({ path: './test/aws/dynamodb.yml' })
	// const client = dynamo.documentClient()
	// const users = new Table(client, 'users')
	// // const posts = new Table(client, 'posts')

	// type User = {
	// 	id: number
	// 	name: string
	// }

	// type Post = {
	// 	id: number
	// 	title: string
	// 	content?: string
	// }

	it('should parse sql to expression', async () => {
		const result1 = ql`#id = ${1}, #name = helper(#name, ${2})`

		expect(result1).toStrictEqual({
			expression: '#id = :v1, #name = helper(#name, :v2)',
			names: { '#id': 'id', '#name': 'name' },
			values: { ':v1': 1, ':v2': 2 }
		})

		const result2 = ql`#other = ${3}`

		expect(result2).toStrictEqual({
			expression: '#other = :v3',
			names: { '#other': 'other' },
			values: { ':v3': 3 }
		})
	})

	// it('should operate', async () => {

	// 	await putItem<User>(users, {
	// 		id: 1,
	// 		name: 'Jack'
	// 	})

	// const user = await getItem<User>(users, { id: 1 })

	// 	console.log(user?.id)

	// await putItem<User>(users, {
	// 	id: 1,
	// 	name: 'Jack'
	// }, {
	// 	condition: ql`#id = ${1}`
	// })

	// 	const result = await query<Post>(posts, {
	// 		keyCondition: ql`#userId = ${1}`
	// 	})

	// 	result.items[0].content

	// })

})
