
import { describe, it, expect } from 'vitest'
import { mockDynamoDB } from '@heat/aws-test'
import { ql, scan, transactWrite, transactPut, transactConditionCheck } from '../src/index'
import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'

describe('DynamoDB Transact', () => {

	mockDynamoDB({ path: './test/aws/dynamodb.yml' })
	const posts = 'posts'

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
		const promise = transactWrite({
			items: [
				transactConditionCheck(posts, { userId: 1, id: 1 }, {
					condition: ql`attribute_not_exists(#id)`
				}),
				transactPut(posts, { userId: 1, id: 4 }),
			]
		})

		await expect(promise).rejects.toThrow(TransactionCanceledException)

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
