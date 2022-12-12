import { startDynamoDB } from '@heat/aws-test'
import { migrate, scan, Table } from '../../../src/services/dynamodb'

describe('Migrate', () => {
	const dynamo = startDynamoDB({
		path: './test/aws/dynamodb.yml',
		seed: {
			posts: [
				{ userId: 1, id: 1, title: 'one' },
				{ userId: 1, id: 2, title: 'two' },
				{ userId: 1, id: 3, title: 'three' },
			]
		}
	})

	const client = dynamo.getDocumentClient()
	const posts = new Table(client, 'posts')

	type Post = {
		userId: number
		id: number
		title: string
	}

	type PostV2 = Post & {
		createdAt: string
	}

	it('should migrate the table', async () => {

		const result = await migrate<Post, PostV2>(posts, {
			batch: 1,
			transform(item) {
				return {
					...item,
					createdAt: (new Date).toISOString()
				}
			}
		})

		expect(result).toStrictEqual({
			itemsProcessed: 3
		})

		const list = await scan<PostV2>(posts)

		expect(list).toStrictEqual({
			cursor: undefined,
			count: 3,
			items: [
				{
					userId: 1,
					id: 1,
					title: 'one',
					createdAt: expect.any(String)
				},
				{
					userId: 1,
					id: 2,
					title: 'two',
					createdAt: expect.any(String)
				},
				{
					userId: 1,
					id: 3,
					title: 'three',
					createdAt: expect.any(String)
				}
			]
		})
	})
})
