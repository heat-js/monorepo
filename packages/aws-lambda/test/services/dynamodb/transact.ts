
import { describe, it, expect } from 'vitest'
import { startDynamoDB } from '@heat/aws-test'
import { Table, ql, scan, transactWrite, transactPut, transactConditionCheck } from '../../../src/services/dynamodb/index'
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'

describe('DynamoDB Transact', () => {

	const dynamo = startDynamoDB({ path: './test/aws/dynamodb.yml' })
	const client = dynamo.getDocumentClient()
	const posts = new Table(client, 'posts')

	it('should transact', async () => {
		await transactWrite({
			items: [
				transactConditionCheck(posts, { userId: 1, id: 0 }, {
					condition: ql`attribute_not_exists(#id)`
				}),

				transactPut(posts, { userId: 1, id: 1 }),
				transactPut(posts, { userId: 1, id: 2 }),
				transactPut(posts, { userId: 1, id: 3 }),
			]
		})

		const result = await scan(posts)
		expect(result).toStrictEqual({
			cursor: undefined,
			count: 3,
			items: [
				{ userId: 1, id: 1 },
				{ userId: 1, id: 2 },
				{ userId: 1, id: 3 }
			]}
		)
	})

	it('should throw on condition error', async () => {
		await expect(transactWrite({
			items: [
				transactConditionCheck(posts, { userId: 1, id: 1 }, {
					condition: ql`attribute_not_exists(#id)`
				}),
				transactPut(posts, { userId: 1, id: 4 }),
			]
		})).rejects.toThrow(TransactionCanceledException)

		const result = await scan(posts)
		expect(result).toStrictEqual({
			cursor: undefined,
			count: 3,
			items: [
				{ userId: 1, id: 1 },
				{ userId: 1, id: 2 },
				{ userId: 1, id: 3 }
			]}
		)
	})
})
